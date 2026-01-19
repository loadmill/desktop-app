import {
  ChildProcessWithoutNullStreams,
  fork,
} from 'child_process';
import path from 'path';
import { setTimeout as sleep } from 'timers/promises';

import '@loadmill/agent/dist/cli';
import { app, ipcMain } from 'electron';

import {
  sendFromAgentViewToRenderer,
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { AgentMessage, MainMessage } from '../types/messaging';
import { Token } from '../types/token';
import {
  DATA,
  FETCH_PROFILES,
  FETCH_SUITES,
  IS_AGENT_CONNECTED,
  IS_AGENT_OUTDATED,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STDERR,
  STDOUT,
  STOP_AGENT,
} from '../universal/constants';

import {
  isPendingConnectOrRestart,
  markAgentDisconnected,
  markAgentRestarting,
  sendAgentUiConnected,
  sendAgentUiConnecting,
  sendAgentUiDisconnected,
  sendAgentUiDisconnecting,
  sendAgentUiOutdated,
} from './agent-ui-status';
import { agentLogger } from './agent/agent-logger';
import {
  isAgentConnected,
  refreshConnectedStatus,
} from './connected-status';
import {
  CALLBACK_URL,
  LOADMILL_AGENT_LOG_LEVEL,
  LOADMILL_AGENT_VERBOSE,
  NODE_OPTIONS,
  NODE_TLS_REJECT_UNAUTHORIZED,
  PLAYWRIGHT_TEST_PACKAGE_CLI_PATH,
  UI_TESTS_ENABLED,
  USER_DATA_PATH,
} from './constants';
import { buildProxyUrlWithCredentials } from './fetch/https-agent';
import { subscribeToMainProcessMessage } from './main-events';
import { get, set } from './persistence-store';
import { AgentActions, LAST_AGENT_ACTION, TOKEN } from './persistence-store/constants';
import { clearProfiles } from './profiles';
import { getLoadmillAgentServerUrl } from './settings/agent-server-url';
import { getSettings } from './settings/settings-store';
import { clearSuites } from './suites';
import { createAndSaveToken, isCorrectUser, isValidToken } from './token';
import { isUserSignedIn, setIsUserSignedIn } from './user-signed-in-status';

let agent: ChildProcessWithoutNullStreams | null;

export const startAgent = (token: string): void => {
  if (!isAgentConnected()) {
    if (!agent || !agent.connected) {
      initAgent();
    }
    if (agent && token) {
      sendToAgentProcess({
        data: { token },
        type: START_AGENT,
      });
    }
    set(LAST_AGENT_ACTION, AgentActions.STARTED);
  }
};

const initAgent = () => {
  agent = createAgentProcess();
  addOnAgentExitEvent();
  addOnAgentIsConnectedEvent();
  if (agent.stdout) {
    pipeAgentStdout();
  }
  if (agent.stderr) {
    pipeAgentStderr();
  }
};

const PACKED_RELATIVE_PATH = path.join(app.getAppPath(), '.webpack', 'main');
const LOADMILL_AGENT = 'loadmill-agent';
const LOADMILL_AGENT_PATH = path.join(PACKED_RELATIVE_PATH, LOADMILL_AGENT);

const createAgentProcess = (): ChildProcessWithoutNullStreams => {
  const proxySettings = getSettings()?.proxy;
  const { enabled: proxyEnabled, bypassPatternsList } = proxySettings || {};
  const env = {
    CALLBACK_URL,
    HOME_DIR: USER_DATA_PATH,
    LOADMILL_AGENT_SERVER_URL: getLoadmillAgentServerUrl(),
    LOADMILL_AGENT_VERBOSE,
    LOG_LEVEL: LOADMILL_AGENT_LOG_LEVEL,
    ...(bypassPatternsList && { LOADMILL_PROXY_BYPASS_LIST: bypassPatternsList }),
    ...(proxyEnabled && { LOADMILL_PROXY_URL: buildProxyUrlWithCredentials(proxySettings) }),
    NODE_OPTIONS,
    NODE_TLS_REJECT_UNAUTHORIZED,
    PLAYWRIGHT_BROWSERS_PATH: '0',
    PLAYWRIGHT_TEST_PACKAGE_CLI_PATH,
    UI_TESTS_ENABLED,
  };
  log.info('Creating agent process with env vars', env);

  return fork(LOADMILL_AGENT_PATH, {
    env,
    stdio: 'pipe',
  });
};

const isAgentKilledExternally = (exitCode: number | null) => exitCode === null;
const isAgentDisconnected = (exitCode: number | null) => exitCode === 0;

const addOnAgentExitEvent = () => {
  agent.on('exit', (code, signal) => {
    if (isAgentKilledExternally(code)) {
      log.info('Agent process killed with signal:', signal);
      return;
    }
    log.info('Agent process exited with code:', code);
    if (isAgentDisconnected(code)) {
      set(LAST_AGENT_ACTION, AgentActions.STOPPED);
    }
    const isConnected = isAgentConnected();
    if (isConnected) {
      sendAgentUiConnected();
    } else {
      sendAgentUiDisconnected(false);
    }
  });
};

const addOnAgentIsConnectedEvent = (): void => {
  agent.on('message', ({ data, type }: MainMessage) => {
    if (type === IS_AGENT_CONNECTED) {
      log.info('Agent message received', { data, type } );
      if (typeof data?.isConnected === 'boolean') {
        if (data.isConnected) {
          sendAgentUiConnected();
        } else {
          sendAgentUiDisconnected(false);
        }
      }
    }
  });
};

const pipeAgentStdout = () => {
  agent.stdout.on(DATA, async (data: string | Buffer) => {
    await handleAgentStd(data, STDOUT);
  });
};

const pipeAgentStderr = () => {
  agent.stderr.on(DATA, async (data: string | Buffer) => {
    await handleAgentStd(data, STDERR);
  });
};

const handleAgentStd = async (
  data: string | Buffer,
  type: typeof STDOUT | typeof STDERR,
) => {
  const text = data.toString();
  log.info('Agent:', text);

  const wasConnected = isAgentConnected();
  handleAgentOutdated(text);
  await handleInvalidToken(text);
  refreshConnectedStatus({ text });

  const isConnected = isAgentConnected();
  if (isConnected !== wasConnected) {
    if (isConnected) {
      sendAgentUiConnected();
    } else {
      sendAgentUiDisconnected(false);
    }
  }

  sendFromAgentViewToRenderer({ data: { text }, type });
  agentLogger.info(text);
};

const handleAgentOutdated = (text: string) => {
  if (text.includes('[ERROR] The agent is outdated')) {
    log.info('Got outdated agent message, stopping agent');
    stopAgent();
    sendAgentUiOutdated();
    if (getSettings()?.autoUpdate === false) {
      log.info('Auto update is disabled, storing LAST_AGENT_ACTION as STOPPED');
      set(LAST_AGENT_ACTION, AgentActions.STOPPED);
    }
    sendFromMainWindowToRenderer({
      data: {
        isAgentOutdated: true,
      },
      type: IS_AGENT_OUTDATED,
    });
  }
};

const stopAgent = (): void => {
  if (agent) {
    sendToAgentProcess({ type: STOP_AGENT });
  }
};

const sendToAgentProcess = (msg: AgentMessage) => {
  if (agent && agent.connected) {
    agent.send(msg);
  }
};

export const subscribeToAgentEventsFromRenderer = (): void => {
  subscribeToUserIsSignedInFromRenderer();
  subscribeToStartAgentFromRenderer();
  subscribeToStopAgentFromRenderer();
};

const subscribeToUserIsSignedInFromRenderer = () => {
  subscribeToMainProcessMessage(SET_IS_USER_SIGNED_IN, handleSetIsUserSignedInEvent);
};

const handleSetIsUserSignedInEvent = async (_event: Electron.IpcMainEvent, { isSignedIn }: MainMessage['data']) => {
  log.info(`Got ${SET_IS_USER_SIGNED_IN} event`, { isSignedIn });
  setIsUserSignedIn(isSignedIn);
  if (isUserSignedIn()) {
    await handleUserIsSignedIn();
  } else {
    handleUserIsSignedOut();
  }
};

const handleUserIsSignedIn = async () => {
  ipcMain.emit(FETCH_SUITES);
  ipcMain.emit(FETCH_PROFILES);

  if (!shouldStartAgent()) {
    return;
  }

  const token = await _getOrCreateToken();
  if (!isValidToken(token)) {
    log.info('Token still does not exists / not valid, could not connect the agent');
    return;
  }
  startAgent(token.token);
};

const shouldStartAgent = (): boolean => {
  if (isAgentConnected()) {
    return false;
  }

  const lastAgentAction = get<string>(LAST_AGENT_ACTION);
  if (lastAgentAction === AgentActions.STOPPED) {
    return false;
  }
  return true;
};

const handleUserIsSignedOut = () => {
  clearSuites();
  clearProfiles();
  if (isAgentConnected()) {
    log.info('Agent is connected, stopping agent...');
    stopAgent();
  }
};

const subscribeToStartAgentFromRenderer = () => {
  subscribeToMainProcessMessage(START_AGENT, handleStartAgentEvent);
};

const handleStartAgentEvent = async () => {
  log.info(`Got ${START_AGENT} event`);

  if (isAgentConnected()) {
    log.info('Agent is already connected');
    sendAgentUiConnected();
    return;
  }

  await attemptToStartAgent();
};

const attemptToStartAgent = async (): Promise<void> => {
  if (!isUserSignedIn()) {
    log.info('User is not signed in, cannot start agent.');
    sendAgentUiDisconnected(false);
    return;
  }

  sendAgentUiConnecting();

  const token = await _getOrCreateToken();
  if (!isValidToken(token)) {
    log.info('Missing or invalid token, cannot start agent.');
    sendAgentUiDisconnected(false);
    return;
  }

  startAgent(token.token);
};

const subscribeToStopAgentFromRenderer = () => {
  subscribeToMainProcessMessage(STOP_AGENT, handleStopAgentEvent);
};

const handleStopAgentEvent = () => {
  log.info(`Got ${STOP_AGENT} event`);
  if (!isAgentConnected() && !isPendingConnectOrRestart()) {
    log.info('Agent is already not connected');
    sendAgentUiDisconnected(isAgentConnected());
    return;
  }

  sendAgentUiDisconnecting(true);

  stopAgent();
  set(LAST_AGENT_ACTION, AgentActions.STOPPED);
};

const handleInvalidToken = async (text: string) => {
  if (text.includes('Invalid token')) {
    log.info('Got Invalid token from agent, fetching new token from loadmill server');
    const token = await createAndSaveToken();
    if (!token) {
      log.error('Token still does not exists / not valid, could not connect the agent');
      return;
    }

    sendToAgentProcess({
      data: { token: token.token },
      type: START_AGENT,
    });
  }
};

const _getOrCreateToken = async (): Promise<Token | undefined> => {
  const token = get<Token>(TOKEN);
  if (isValidToken(token) && await isCorrectUser(token.owner)) {
    return token;
  }

  log.info('Token does not exists / old format / of a different user');
  log.info('Fetching new token from loadmill server');
  return await createAndSaveToken();
};

export const killAgentProcess = (): void => {
  if (agent) {
    log.info('Killing agent process');
    agent.kill('SIGINT');
  }
};

export const restartAgentProcess = async (): Promise<void> => {
  log.info('Restarting agent process');
  markAgentRestarting();
  try {
    stopAgent();
    await terminateAgentProcess();
  } catch (error) {
    log.warn('Terminate Agent encountered an error, but proceeding with restart.', error);
  }

  log.info('Marking agent as disconnected');
  markAgentDisconnected();

  if (get<string>(LAST_AGENT_ACTION) === AgentActions.STOPPED) {
    log.info('Agent was manually stopped. Skipping auto-start.');
    return;
  }

  log.info('Attempting to start a new agent process');
  await attemptToStartAgent();
};

/**
 * Attempt graceful shutdown, escalate to force kill.
 * Always resolve after max wait.
 */
const terminateAgentProcess = async (): Promise<void> => {
  log.info('Terminating agent process');

  if (!agent) {
    log.info('No agent process to terminate, skipping.');
    return;
  }

  const child = agent;
  agent = null;
  child.removeAllListeners();

  const hasProcessExited = () => child.exitCode !== null || child.signalCode !== null;

  const waitForExit = async (maxWaitMs: number): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (hasProcessExited()) {
        return true;
      }
      await sleep(1000);
    }
    return hasProcessExited();
  };

  const tryKill = (signal: NodeJS.Signals) => {
    try {
      log.info('Sending kill signal to agent process', { signal });
      child.kill(signal);
    } catch (error) {
      log.info('Error while sending signal (ignored)', { error, signal });
    }
  };

  try {
    log.info('Attempting graceful shutdown of agent process');
    tryKill('SIGINT');
    if (await waitForExit(10000)) {
      log.info('Agent process exitted gracefully');
      return;
    }

    log.info('Attempting forceful shutdown of agent process');
    tryKill('SIGKILL');
    if (await waitForExit(10000)) {
      log.info('Agent process exitted forcefully');
      return;
    }

    log.warn('Max wait time exceeded for agent process termination, proceeding anyway');
  } catch (error) {
    log.error('Unexpected error while terminating agent process', error);
  }
};
