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

sendToMainProcess({
  data: { text: 'Environment variables:' },
  type: IS_AGENT_CONNECTED,
});
sendToMainProcess({
  data: { text: JSON.stringify(process.env) },
  type: IS_AGENT_CONNECTED,
});

sendToMainProcess({
  data: { text: 'execPath:' },
  type: IS_AGENT_CONNECTED,
});
sendToMainProcess({
  data: { text: process.execPath },
  type: IS_AGENT_CONNECTED,
});

sendToMainProcess({
  data: { text: 'process.version:' },
  type: IS_AGENT_CONNECTED,
});
sendToMainProcess({
  data: { text: process.version },
  type: IS_AGENT_CONNECTED,
});

sendToMainProcess({ data: { text: 'Loadmill agent process started' }, type: IS_AGENT_CONNECTED });
