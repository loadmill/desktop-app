import {
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  FIND_NEXT,
  GENERATE_TOKEN,
  GO_BACK,
  GO_FORWARD,
  IS_AGENT_CONNECTED,
  LOADMILL_VIEW_ID,
  MAIN_WINDOW_ID,
  NAVIGATION,
  PROXY,
  REFRESH_ENTRIES,
  REFRESH_FILTERS,
  REFRESH_PAGE,
  SAVE_AS_HAR,
  SAVED_AS_HAR_SUCCESS,
  SAVED_TOKEN,
  SET_FILTERS,
  SET_IS_USER_SIGNED_IN,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STOP_AGENT,
  TOGGLE_MAXIMIZE_WINDOW,
  UPDATED_ENTRIES,
  UPDATED_FILTERS
} from '../universal/constants';

import { Navigation } from './navigation';
import { ProxyEntry } from './proxy-entry';

/**
 * IPC = Inter Process Communication (https://www.electronjs.org/docs/latest/tutorial/ipc)
 */
interface IPCMessage {
  data?: { [key: string]: string[] | string | boolean | number | Navigation | ProxyEntry | ProxyEntry[] };
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
    filters?: string[];
    isConnected?: boolean;
    isSignedIn?: boolean;
    text?: string;
    toFind?: string;
    token?: string;
  };
  type: MainMessageTypes;
}

export abstract class RendererMessage implements IPCMessage {
  data?: {
    isAgentConnected?: boolean;
    loadmillViewId?: number;
    mainWindowId?: number;
    nav?: Navigation;
    proxy?: ProxyEntry;
    shouldShowFind?: boolean;
    token?: string;
  };
  type: RendererMessageTypes;
}

export abstract class ProxyRendererMessage implements IPCMessage {
  data?: {
    filters?: string[];
    proxies?: ProxyEntry[];
    proxy?: ProxyEntry;
  };
  type: ProxyRendererMessageTypes;
}

export type AgentMessageTypes =
  typeof IS_AGENT_CONNECTED |
  typeof START_AGENT |
  typeof STOP_AGENT;

export type MainMessageTypes =
  typeof DOWNLOAD_CERTIFICATE |
  typeof FIND_NEXT |
  typeof GO_BACK |
  typeof GO_FORWARD |
  typeof IS_AGENT_CONNECTED |
  typeof REFRESH_ENTRIES |
  typeof REFRESH_FILTERS |
  typeof REFRESH_PAGE |
  typeof SAVE_AS_HAR |
  typeof SET_FILTERS |
  typeof SET_IS_USER_SIGNED_IN |
  typeof START_AGENT |
  typeof STOP_AGENT |
  typeof TOGGLE_MAXIMIZE_WINDOW;

export type RendererMessageTypes =
  typeof GENERATE_TOKEN |
  typeof IS_AGENT_CONNECTED |
  typeof LOADMILL_VIEW_ID |
  typeof MAIN_WINDOW_ID |
  typeof NAVIGATION |
  typeof SAVED_TOKEN |
  typeof SHOW_FIND_ON_PAGE;

export type ProxyRendererMessageTypes =
  typeof DOWNLOADED_CERTIFICATE_SUCCESS |
  typeof SAVED_AS_HAR_SUCCESS |
  typeof UPDATED_ENTRIES |
  typeof UPDATED_FILTERS |
  typeof PROXY;
