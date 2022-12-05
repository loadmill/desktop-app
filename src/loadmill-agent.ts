import { start } from '@loadmill/agent';

import {
  IS_AGENT_CONNECTED,
  START_AGENT,
  STOP_AGENT
} from './constants';
import { ProcessMessageAgent, ProcessMessageMain } from './types/messaging';

let stop: (() => void) | null = null;

process.on('message', ({ type, data }: ProcessMessageAgent) => {
  switch (type) {
    case START_AGENT:
      startAgent(data);
      break;
    case STOP_AGENT:
      stopAgent();
      break;
    case IS_AGENT_CONNECTED:
      sendIsConnected();
      break;
  }
});

const startAgent = (data: ProcessMessageAgent['data']) => {
  if (data && data.token) {
    stop = start({
      token: data.token
    });
  }
};

const stopAgent = () => {
  if (stop) {
    stop();
    stop = null;
  }
};

const sendIsConnected = () => {
  sendToMainProcess({
    data: { isConnected: !!stop },
    type: IS_AGENT_CONNECTED
  });
};

const sendToMainProcess = (msg: ProcessMessageMain) => {
  process.send(msg);
};
