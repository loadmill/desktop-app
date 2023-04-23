import { ChildProcessWithoutNullStreams, fork } from 'child_process';

import '@loadmill/agent/dist/cli';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
import log from '../log';
import { AgentMessage, MainMessage } from '../types/messaging';
import { Token } from '../types/token';
import {
  DATA,
  IS_AGENT_CONNECTED,
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
  LOADMILL_AGENT_PATH,
  LOADMILL_AGENT_SERVER_URL,
  NODE_OPTIONS,
  NODE_TLS_REJECT_UNAUTHORIZED
} from './constants';
import { subscribeToMainProcessMessage } from './main-events';
import { get } from './store';
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
  return fork(LOADMILL_AGENT_PATH, {
    env: {
      LOADMILL_AGENT_SERVER_URL,
      NODE_OPTIONS,
      NODE_TLS_REJECT_UNAUTHORIZED,
    },
    stdio: 'pipe',
  });
};

const addOnAgentExitEvent = () => {
  agent.on('exit', (code) => {
    log.info('Agent process exited with code:', code);
    sendToRenderer({
      data: {
        isAgentConnected: isAgentConnected(),
      },
      type: IS_AGENT_CONNECTED,
    });
  });
};

const addOnAgentIsConnectedEvent = (): void => {
  agent.on('message', ({ data, type }: MainMessage) => {
    if (type === IS_AGENT_CONNECTED) {
      log.info('Agent message received', { data, type } );
      sendToRenderer({
        data: {
          isAgentConnected: data.isConnected,
        },
        type: IS_AGENT_CONNECTED,
      });
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
  log.info('Checking if token exists...');
  const token = get<Token>(TOKEN);
  if (isValidToken(token) && await isCorrectUser(token.owner)) {
    log.info('Token exists && valid');
    if (!isAgentConnected()) {
      log.info('Agent not connected, connecting agent...');
      startAgent(token.token);
    }
  } else {
    log.info('Token does not exists / old format / of a different user');
    log.info('Fetching new token from loadmill server');
    await createAndSaveToken();
    const token = get<Token>(TOKEN);
    if (isValidToken(token)) {
      startAgent(token.token);
    } else {
      log.info('Token still does not exists / not valid, could not connect the agent');
    }
  }
};

const handleUserIsSignedOut = () => {
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
  if (!isUserSignedIn()) {
    log.info('User is not signed in, could not connect the agent');
    return;
  }
  if (isAgentConnected()) {
    log.info('Agent is already connected');
    sendToRenderer({
      data: {
        isAgentConnected: isAgentConnected(),
      },
      type: IS_AGENT_CONNECTED,
    });
    return;
  }
  let token = get(TOKEN) as string;
  if (!token) {
    log.info('Token does not exists, fetching new token from loadmill server');
    await createAndSaveToken();
    token = get(TOKEN) as string;
    if (!token) {
      log.info('Token still does not exists, could not connect the agent');
      return;
    }
  }
  startAgent(token);
};

const subscribeToStopAgentFromRenderer = () => {
  subscribeToMainProcessMessage(STOP_AGENT, handleStopAgentEvent);
};

const handleStopAgentEvent = () => {
  log.info(`Got ${STOP_AGENT} event`);
  if (!isAgentConnected()) {
    log.info('Agent is already not connected');
    sendToRenderer({
      data: {
        isAgentConnected: isAgentConnected(),
      },
      type: IS_AGENT_CONNECTED,
    });
    return;
  }
  stopAgent();
};

const handleInvalidToken = (text: string) => {
  if (text.includes('Invalid token')) {
    log.info('Got Invalid token from agent, fetching new token from loadmill server');
    createAndSaveToken();
  }
};
