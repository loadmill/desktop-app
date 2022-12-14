import {
  GENERATE_TOKEN,
  GO_BACK,
  GO_FORWARD,
  IS_AGENT_CONNECTED,
  LOADMILL_VIEW_ID,
  MAIN_WINDOW_ID,
  NAVIGATION,
  NEW_TOKEN,
  REFRESH_PAGE,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
  TOGGLE_MAXIMIZE_WINDOW
} from '../universal/constants';

import { Navigation } from './navigation';

/**
 * IPC = Inter Process Communication (https://www.electronjs.org/docs/latest/tutorial/ipc)
 */
interface IPCMessage {
  data?: { [key: string]: string[] | string | boolean | number | Navigation; };
  type: string;
}

export abstract class AgentMessage implements IPCMessage {
  data?: {
    token: string;
  };
  type: AgentMessageTypes;
}

export abstract class MainMessage implements IPCMessage {
  data?: {
    isConnected?: boolean;
    isSignedIn?: boolean;
    text?: string;
    token?: string;
  };
  type: MainMessageTypes;
}

export abstract class RendererMessage implements IPCMessage {
  data?: {
    loadmillViewId?: number;
    mainWindowId?: number;
    nav?: Navigation;
    token?: string;
  };
  type: RendererMessageTypes;
}

export type AgentMessageTypes =
  typeof IS_AGENT_CONNECTED |
  typeof START_AGENT |
  typeof STOP_AGENT;

export type MainMessageTypes =
  typeof GO_BACK |
  typeof GO_FORWARD |
  typeof IS_AGENT_CONNECTED |
  typeof NEW_TOKEN |
  typeof REFRESH_PAGE |
  typeof SET_IS_USER_SIGNED_IN |
  typeof TOGGLE_MAXIMIZE_WINDOW;

export type RendererMessageTypes =
  typeof GENERATE_TOKEN |
  typeof LOADMILL_VIEW_ID |
  typeof MAIN_WINDOW_ID |
  typeof NAVIGATION |
  typeof SAVED_TOKEN;
