import { start } from '@loadmill/agent';

import { AgentMessage, MainMessage } from '../types/messaging';
import {
  IS_AGENT_CONNECTED,
  START_AGENT,
  STOP_AGENT,
} from '../universal/constants';

let stop: (() => void) | null = null;

process.on('message', ({ type, data }: AgentMessage) => {
  switch (type) {
    case START_AGENT:
      startAgent(data);
      sendIsConnected();
      break;
    case STOP_AGENT:
      stopAgent();
      sendIsConnected();
      break;
    case IS_AGENT_CONNECTED:
      sendIsConnected();
      break;
  }
});

const startAgent = (data: AgentMessage['data']) => {
  if (data && data.token) {
    stop = start({
      token: data.token,
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
    type: IS_AGENT_CONNECTED,
  });
};

const sendToMainProcess = (msg: MainMessage) => {
  process.send(msg);
};
