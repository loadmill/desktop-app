import { ChildProcessWithoutNullStreams, fork } from 'child_process';

import '@loadmill/agent/dist/cli';
import { app, ipcMain } from 'electron';

import { appendToAgentLog } from './agent-log-file';
import {
  isAgentConnected,
  refreshConnectedStatus
} from './connected-status';
import {
  DATA,
  GENERATE_TOKEN,
  IS_AGENT_CONNECTED,
  LOADMILL_AGENT,
  NEW_TOKEN,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
  TOKEN
} from './constants';
import log from './log';
import { sendToRenderer } from './main-to-renderer';
import { get, set } from './store';
import { AgentMessage, MainMessage } from './types/messaging';
import { isUserSignedIn, setIsUserSignedIn } from './user-signed-in-status';

let agent: ChildProcessWithoutNullStreams | null;

export const startAgent = (_event: Electron.IpcMainEvent, token: string): void => {
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
    LOADMILL_AGENT_SERVER_URL: process.env.LOADMILL_AGENT_SERVER_URL,
    NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
  });
  return fork(app.getAppPath() + '/.webpack/main/' + LOADMILL_AGENT, {
    env: {
      LOADMILL_AGENT_SERVER_URL: process.env.LOADMILL_AGENT_SERVER_URL,
      NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
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
    pipeAgentStd(data);
  });
};

const pipeAgentStderr = () => {
  agent.stderr.on(DATA, (data: string | Buffer) => {
    pipeAgentStd(data);
  });
};

const pipeAgentStd = (data: string | Buffer) => {
  const text = Buffer.from(data).toString();
  log.info('Agent:', text);
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
  subscribeToNewTokenFromRenderer();
  subscribeToUserIsSignedInFromRenderer();
};

const subscribeToNewTokenFromRenderer = () => {
  ipcMain.on(NEW_TOKEN, handleNewTokenFromRenderer);
};

const handleNewTokenFromRenderer = (_event: Electron.IpcMainEvent, { token }: MainMessage['data']) => {
  log.info('Setting new token', '*'.repeat(token.length - 4) + token.substring(token.length - 4));
  set(TOKEN, token);
  if (isUserSignedIn()) {
    log.info('User is signed in, starting agent...');
    startAgent(_event, token);
  } else {
    log.info(`User not signed in, sending ${SAVED_TOKEN} event to renderer`);
    sendToRenderer({ type: SAVED_TOKEN });
  }
};

const subscribeToUserIsSignedInFromRenderer = () => {
  ipcMain.on(SET_IS_USER_SIGNED_IN, handleSetIsUserSignedInEvent);
};

const handleSetIsUserSignedInEvent = (_event: Electron.IpcMainEvent, { isSignedIn }: MainMessage['data']) => {
  log.info(`Got ${SET_IS_USER_SIGNED_IN} event`);
  setIsUserSignedIn(isSignedIn);
  if (isUserSignedIn()) {
    log.info('User is signed in, checking if token exists...');
    const token = get(TOKEN);
    if (token) {
      log.info('Token exists');
      if (!isAgentConnected()) {
        log.info('Agent not connected, connecting agent...');
        startAgent(_event, token);
      }
    } else {
      log.info(`Token does not exists, sending ${GENERATE_TOKEN} event to renderer`);
      sendToRenderer({ type: GENERATE_TOKEN });
    }
  } else { // user signed out
    log.info('user signed out');
    if (isAgentConnected()) {
      log.info('Agent is connected, stopping agent...');
      stopAgent();
    }
  }
};
