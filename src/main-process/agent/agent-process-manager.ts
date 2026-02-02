import {
  ChildProcessWithoutNullStreams,
  fork,
} from 'child_process';
import path from 'path';
import { setTimeout as sleep } from 'timers/promises';

import '@loadmill/agent/dist/cli';
import { app } from 'electron';

import log from '../../log';
import { AgentMessage } from '../../types/messaging';
import {
  CALLBACK_URL,
  LOADMILL_AGENT_LOG_LEVEL,
  LOADMILL_AGENT_VERBOSE,
  NODE_OPTIONS,
  NODE_TLS_REJECT_UNAUTHORIZED,
  PLAYWRIGHT_TEST_PACKAGE_CLI_PATH,
  UI_TESTS_ENABLED,
  USER_DATA_PATH,
} from '../constants';
import { buildProxyUrlWithCredentials } from '../fetch/https-agent';
import { getLoadmillAgentServerUrl } from '../settings/agent-server-url';
import { getSettings } from '../settings/settings-store';

import { pipeAgentStderr, pipeAgentStdout } from './agent-log-processor';
import {
  addOnAgentExitEvent,
} from './agent-process-events';

let agent: ChildProcessWithoutNullStreams | null;

const PACKED_RELATIVE_PATH = path.join(app.getAppPath(), '.webpack', 'main');
const LOADMILL_AGENT = 'loadmill-agent';
const LOADMILL_AGENT_PATH = path.join(PACKED_RELATIVE_PATH, LOADMILL_AGENT);

export const isAgentProcessAlive = (): boolean => {
  return agent && agent.connected;
};

export const killAgentProcess = (): void => {
  if (agent) {
    log.info('Killing agent process');
    agent.kill('SIGINT');
  }
};

export const sendToAgentProcess = (msg: AgentMessage): void => {
  if (!isAgentProcessAlive()) {
    log.error('Cannot send message to agent process: process is not online', msg);
    return;
  }
  agent.send(msg);
};

export const getAgentProcess = (): ChildProcessWithoutNullStreams | null => {
  return agent;
};

export const initAgentProcess = (): void => {
  agent = createAgentProcess();
  addOnAgentExitEvent(agent);
  if (agent.stdout) {
    pipeAgentStdout(agent.stdout);
  }
  if (agent.stderr) {
    pipeAgentStderr(agent.stderr);
  }
};

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

/**
 * Attempt graceful shutdown, escalate to force kill.
 * Always resolve after max wait.
 */
export const terminateAgentProcess = async (): Promise<void> => {
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
