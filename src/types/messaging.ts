import {
  GET_TOKEN,
  INIT_AGENT_LOG,
  IS_AGENT_CONNECTED,
  START_AGENT,
  STDERR,
  STDOUT,
  STOP_AGENT
} from '../constants';

interface ProcessMessage {
  type: ProcessMessageTypes;
}

export interface ProcessMessageAgent extends ProcessMessage {
  data?: {
    token: string;
  };
}

export interface ProcessMessageMain extends ProcessMessage {
  data: {
    isConnected?: boolean;
    token?: string;
  };
}

export interface ProcessMessageRenderer extends ProcessMessage {
  data: {
    isConnected?: boolean;
    lines?: string[];
    text?: string;
    token?: string;
  };
}

export type ProcessMessageTypes =
  typeof GET_TOKEN |
  typeof INIT_AGENT_LOG |
  typeof IS_AGENT_CONNECTED |
  typeof START_AGENT |
  typeof STDERR |
  typeof STDOUT |
  typeof STOP_AGENT;
