import {
  CLEAR_ALL_ENTRIES,
  DELETE_ENTRY,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORT_AS_HAR,
  EXPORTED_AS_HAR_SUCCESS,
  FETCH_SUITES,
  FIND_NEXT,
  GENERATE_TOKEN,
  GET_IP_ADDRESS,
  GO_BACK,
  GO_FORWARD,
  IP_ADDRESS,
  IS_AGENT_CONNECTED,
  IS_RECORDING,
  LOADMILL_VIEW_ID,
  MAIN_WINDOW_ID,
  NAVIGATION,
  PROXY,
  REFRESH_ENTRIES,
  REFRESH_FILTERS,
  REFRESH_PAGE,
  SAVED_TOKEN,
  SET_FILTERS,
  SET_IS_RECORDING,
  SET_IS_USER_SIGNED_IN,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
  UPDATED_ENTRIES,
  UPDATED_FILTERS,
  UPDATED_SUITES
} from '../universal/constants';

import { Navigation } from './navigation';
import { ProxyEntry } from './proxy-entry';
import { SuiteOption } from './suite';
import { ViewValue } from './views';

/**
 * IPC = Inter Process Communication (https://www.electronjs.org/docs/latest/tutorial/ipc)
 */
interface IPCMessage {
  data?: { [key: string]: string[] | string | boolean | number | Navigation | ProxyEntry | ProxyEntry[] | SuiteOption[] };
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
    entryId?: string;
    filters?: string[];
    ipvFamily?: 'IPv4' | 'IPv6';
    isConnected?: boolean;
    isRecording?: boolean;
    isSignedIn?: boolean;
    text?: string;
    toFind?: string;
    token?: string;
    view?: ViewValue;
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

export abstract class LoadmillViewRendererMessage implements IPCMessage {
  data?: {};
  type: LoadmillViewRendererMessageTypes;
}

export abstract class ProxyRendererMessage implements IPCMessage {
  data?: {
    filters?: string[];
    ipAddress?: string;
    isRecording?: boolean;
    proxies?: ProxyEntry[];
    proxy?: ProxyEntry;
    suites?: SuiteOption[];
  };
  type: ProxyRendererMessageTypes;
}

export type AgentMessageTypes =
  typeof IS_AGENT_CONNECTED |
  typeof START_AGENT |
  typeof STOP_AGENT;

export type MainMessageTypes =
  typeof CLEAR_ALL_ENTRIES |
  typeof DELETE_ENTRY |
  typeof DOWNLOAD_CERTIFICATE |
  typeof FETCH_SUITES |
  typeof FIND_NEXT |
  typeof GET_IP_ADDRESS |
  typeof GO_BACK |
  typeof GO_FORWARD |
  typeof IS_AGENT_CONNECTED |
  typeof IS_RECORDING |
  typeof REFRESH_ENTRIES |
  typeof REFRESH_FILTERS |
  typeof REFRESH_PAGE |
  typeof EXPORT_AS_HAR |
  typeof SET_FILTERS |
  typeof SET_IS_RECORDING |
  typeof SET_IS_USER_SIGNED_IN |
  typeof START_AGENT |
  typeof STOP_AGENT |
  typeof SWITCH_VIEW |
  typeof TOGGLE_MAXIMIZE_WINDOW;

export type RendererMessageTypes =
  typeof GENERATE_TOKEN |
  typeof IS_AGENT_CONNECTED |
  typeof LOADMILL_VIEW_ID |
  typeof MAIN_WINDOW_ID |
  typeof NAVIGATION |
  typeof SAVED_TOKEN |
  typeof SHOW_FIND_ON_PAGE;

export type LoadmillViewRendererMessageTypes =
  typeof GENERATE_TOKEN |
  typeof SAVED_TOKEN;

export type ProxyRendererMessageTypes =
  typeof DOWNLOADED_CERTIFICATE_SUCCESS |
  typeof IP_ADDRESS |
  typeof IS_RECORDING |
  typeof EXPORTED_AS_HAR_SUCCESS |
  typeof UPDATED_ENTRIES |
  typeof UPDATED_FILTERS |
  typeof UPDATED_SUITES |
  typeof PROXY;
