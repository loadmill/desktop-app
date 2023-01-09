import { ChildProcessWithoutNullStreams, fork } from 'child_process';

import '@loadmill/agent/dist/cli';
import { app, ipcMain } from 'electron';

import log from '../log';
import { AgentMessage, MainMessage } from '../types/messaging';
import {
  DATA,
  IS_AGENT_CONNECTED,
  LOADMILL_AGENT,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
  TOKEN
} from '../universal/constants';

import { appendToAgentLog } from './agent-log-file';
import {
  isAgentConnected,
  refreshConnectedStatus
} from './connected-status';
import {
  LOADMILL_AGENT_SERVER_URL,
  NODE_TLS_REJECT_UNAUTHORIZED
} from './constants';
import { get } from './store';
import { createAndSaveToken } from './token';
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

const createAgentProcess = (): ChildProcessWithoutNullStreams => {
  log.info('Creating agent process with env vars', {
    LOADMILL_AGENT_SERVER_URL,
    NODE_TLS_REJECT_UNAUTHORIZED,
  });
  return fork(app.getAppPath() + '/.webpack/main/' + LOADMILL_AGENT, {
    env: {
      LOADMILL_AGENT_SERVER_URL,
      NODE_TLS_REJECT_UNAUTHORIZED,
    },
    stdio: 'pipe',
  });
};

const addOnAgentExitEvent = () => {
  agent.on('exit', (code) => {
    log.info('Agent process exited with code:', code);
  });
};

const addOnAgentIsConnectedEvent = (): void => {
  agent.on('message', ({ data, type }: MainMessage) => {
    if (type === IS_AGENT_CONNECTED) {
      log.info({ data, type: IS_AGENT_CONNECTED });
    }
  });
};

const pipeAgentStdout = () => {
  agent.stdout.on(DATA, (data: string | Buffer) => {
    handleAgentStd(data);
  });
};

const pipeAgentStderr = () => {
  agent.stderr.on(DATA, (data: string | Buffer) => {
    handleAgentStd(data);
  });
};

const handleAgentStd = (data: string | Buffer) => {
  const text = Buffer.from(data).toString();
  log.info('Agent:', text);
  handleInvalidToken(text);
  refreshConnectedStatus({ text });
  appendToAgentLog(text);
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
};

const subscribeToUserIsSignedInFromRenderer = () => {
  ipcMain.on(SET_IS_USER_SIGNED_IN, handleSetIsUserSignedInEvent);
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
  log.info('Checking if token exists...');
  const token = get(TOKEN);
  if (token) {
    log.info('Token exists');
    if (!isAgentConnected()) {
      log.info('Agent not connected, connecting agent...');
      startAgent(token);
    }
  } else {
    log.info('Token does not exists, fetching new token from loadmill server');
    await createAndSaveToken();
    const token = get(TOKEN);
    if (token) {
      startAgent(token);
    } else {
      log.info('Token still does not exists, could not connect the agent');
    }
  }
};

const handleUserIsSignedOut = () => {
  if (isAgentConnected()) {
    log.info('Agent is connected, stopping agent...');
    stopAgent();
  }
};

const handleInvalidToken = (text: string) => {
  if (text.includes('Invalid token')) {
    log.info('Got Invalid token from agent, fetching new token from loadmill server');
    createAndSaveToken();
  }
};
