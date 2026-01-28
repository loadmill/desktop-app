import { start } from '@loadmill/agent';

import { AgentMessage } from '../types/messaging';
import {
  START_AGENT,
  STOP_AGENT,
} from '../universal/constants';

let stop: (() => void) | null = null;

process.on('message', ({ type, data }: AgentMessage) => {
  switch (type) {
    case START_AGENT:
      startAgent(data);
      break;
    case STOP_AGENT:
      stopAgent();
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
