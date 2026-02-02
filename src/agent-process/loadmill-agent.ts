import { start } from '@loadmill/agent';

import { AgentMessage } from '../types/messaging';
import {
  AGENT_CONNECT,
  AGENT_DISCONNECT,
} from '../universal/constants';

let stop: (() => void) | null = null;

process.on('message', ({ type, data }: AgentMessage) => {
  switch (type) {
    case AGENT_CONNECT:
      connectAgent(data);
      break;
    case AGENT_DISCONNECT:
      disconnectAgent();
      break;
  }
});

const connectAgent = (data: AgentMessage['data']) => {
  if (data && data.token) {
    stop = start({
      token: data.token,
    });
  }
};

const disconnectAgent = () => {
  if (stop) {
    stop();
    stop = null;
  }
};
