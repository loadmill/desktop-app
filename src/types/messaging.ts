import {
  ANALYZE_REQUESTS,
  ANALYZE_REQUESTS_COMPLETE,
  CLEAR_ALL_ENTRIES,
  CODEGEN,
  COPY_URL,
  CREATE_TEST,
  CREATE_TEST_COMPLETE,
  DELETE_ENTRIES,
  DELETE_ENTRY,
  DOWNLOAD_AGENT_LOG,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORT_AS_HAR,
  EXPORTED_AS_HAR_SUCCESS,
  FETCH_PROFILES,
  FETCH_SETTINGS,
  FETCH_SUITES,
  FIND_NEXT,
  GET_IP_ADDRESS,
  GET_PORT,
  GET_PROFILE,
  GO_BACK,
  GO_FORWARD,
  IMPORT_HAR,
  IMPORT_HAR_IS_IN_PROGRESS,
  INIT_FILTER_REGEX,
  IP_ADDRESS,
  IS_AGENT_CONNECTED,
  IS_AGENT_OUTDATED,
  IS_RECORDING,
  LOADMILL_VIEW_ID,
  MAGIC_TOKEN,
  MAIN_WINDOW_ID,
  MARK_RELEVANT,
  NAVIGATION,
  PORT,
  PROXY,
  REFRESH_ENTRIES,
  REFRESH_PAGE,
  SET_FILTER_REGEX,
  SET_IS_RECORDING,
  SET_IS_USER_SIGNED_IN,
  SET_PROFILE,
  SETTING_CHANGED,
  SHOW_AUTH_TOKEN_INPUT,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STARTUP_PROGRESS,
  STDERR,
  STDOUT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
  UPDATED_ENTRIES,
  UPDATED_PROFILES,
  UPDATED_SUITES,
} from '../universal/constants';

import { AgentStatus } from './agent-status';
import { IpAddressFamily } from './ip-address';
import { Navigation } from './navigation';
import { PlaywrightStepLocation } from './playwright';
import { ProxyEntry } from './proxy-entry';
import { ChangedSetting, Settings } from './settings';
import { StartupProgress } from './startup-progress';
import { SuiteOption } from './suite';
import { ViewName } from './views';

/**
 * IPC = Inter Process Communication (https://www.electronjs.org/docs/latest/tutorial/ipc)
 */
interface IPCMessage {
  data?: {
    [key: string]: string[] | string | boolean | number | null |
    Navigation | ProxyEntry | ProxyEntry[] | SuiteOption[] | SuiteOption | Settings | ChangedSetting | PlaywrightStepLocation
  };
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
    changedSetting?: ChangedSetting;
    entryId?: string;
    entryIds?: string[];
    filterRegex?: string;
    ipvFamily?: IpAddressFamily;
    isConnected?: boolean;
    isFocused?: boolean;
    isRecording?: boolean;
    isSignedIn?: boolean;
    playwrightStepLocation?: PlaywrightStepLocation;
    profile?: string;
    search?: string;
    startupProgress?: StartupProgress;
    suite?: SuiteOption | null;
    text?: string;
    toFind?: string;
    token?: string;
    url?: string;
    view?: ViewName;
  };
  type: MainMessageTypes;
}

export type RendererMessage =
  MainWindowRendererMessage |
  LoadmillViewRendererMessage |
  ProxyRendererMessage |
  AgentRendererMessage |
  SettingsRendererMessage |
  StartupRendererMessage;

export abstract class MainWindowRendererMessage implements IPCMessage {
  data?: {
    agentStatus?: AgentStatus;
    isAgentConnected?: boolean;
    isAgentOutdated?: boolean;
    loadmillViewId?: number;
    magicToken?: string;
    mainWindowId?: number;
    nav?: Navigation;
    proxy?: ProxyEntry;
    shouldShowFind?: boolean;
    text?: string;
    view?: ViewName;
  };
  type: RendererMessageTypes;
}

export abstract class LoadmillViewRendererMessage implements IPCMessage {
  data?: {
    magicToken?: string;
  };
  type: LoadmillViewRendererMessageTypes;
}

export abstract class ProxyRendererMessage implements IPCMessage {
  data?: {
    canceledAction?: boolean;
    error?: string;
    filterRegex?: string;
    ipAddress?: string;
    isRecording?: boolean;
    port?: number;
    profile?: string;
    profiles?: string[];
    proxies?: ProxyEntry[];
    proxy?: ProxyEntry;
    search?: string;
    suites?: SuiteOption[];
  };
  type: ProxyRendererMessageTypes;
}

export abstract class AgentRendererMessage implements IPCMessage {
  data?: {
    lines?: string[];
    text?: string;
  };
  type: AgentRendererMessageTypes;
}

export abstract class SettingsRendererMessage implements IPCMessage {
  data?: {
    error?: string;
    notification?: string;
    settings?: Settings;
  };
  type: SettingsRendererMessageTypes;
}

export abstract class StartupRendererMessage implements IPCMessage {
  data?: {
    startupProgress?: StartupProgress;
  };
  type: StartupRendererMessageTypes;
}

export type AgentMessageTypes =
  typeof IS_AGENT_CONNECTED |
  typeof START_AGENT |
  typeof STOP_AGENT;

export type MainMessageTypes =
  typeof ANALYZE_REQUESTS |
  typeof CLEAR_ALL_ENTRIES |
  typeof CODEGEN |
  typeof COPY_URL |
  typeof CREATE_TEST |
  typeof DELETE_ENTRIES |
  typeof DELETE_ENTRY |
  typeof DOWNLOAD_AGENT_LOG |
  typeof DOWNLOAD_CERTIFICATE |
  typeof EXPORT_AS_HAR |
  typeof FETCH_PROFILES |
  typeof FETCH_SETTINGS |
  typeof FETCH_SUITES |
  typeof FIND_NEXT |
  typeof GET_IP_ADDRESS |
  typeof GET_PORT |
  typeof GET_PROFILE |
  typeof GO_BACK |
  typeof GO_FORWARD |
  typeof IMPORT_HAR |
  typeof INIT_FILTER_REGEX |
  typeof IS_AGENT_CONNECTED |
  typeof IS_RECORDING |
  typeof MARK_RELEVANT |
  typeof REFRESH_ENTRIES |
  typeof REFRESH_PAGE |
  typeof SET_FILTER_REGEX |
  typeof SET_IS_RECORDING |
  typeof SET_PROFILE |
  typeof SET_IS_USER_SIGNED_IN |
  typeof SETTING_CHANGED |
  typeof START_AGENT |
  typeof STARTUP_PROGRESS |
  typeof STOP_AGENT |
  typeof SWITCH_VIEW |
  typeof TOGGLE_MAXIMIZE_WINDOW;

export type RendererMessageTypes =
  typeof IS_AGENT_CONNECTED |
  typeof IS_AGENT_OUTDATED |
  typeof LOADMILL_VIEW_ID |
  typeof MAIN_WINDOW_ID |
  typeof NAVIGATION |
  typeof MAGIC_TOKEN |
  typeof SHOW_AUTH_TOKEN_INPUT |
  typeof SHOW_FIND_ON_PAGE |
  typeof STDERR |
  typeof STDOUT |
  typeof SWITCH_VIEW;

export type LoadmillViewRendererMessageTypes =
  typeof MAGIC_TOKEN |
  typeof SHOW_AUTH_TOKEN_INPUT;

export type ProxyRendererMessageTypes =
  typeof ANALYZE_REQUESTS_COMPLETE |
  typeof CREATE_TEST_COMPLETE |
  typeof DOWNLOADED_CERTIFICATE_SUCCESS |
  typeof GET_PROFILE |
  typeof IMPORT_HAR |
  typeof IMPORT_HAR_IS_IN_PROGRESS |
  typeof INIT_FILTER_REGEX |
  typeof IP_ADDRESS |
  typeof IS_RECORDING |
  typeof EXPORTED_AS_HAR_SUCCESS |
  typeof UPDATED_ENTRIES |
  typeof UPDATED_PROFILES |
  typeof UPDATED_SUITES |
  typeof PORT |
  typeof PROXY;

export type AgentRendererMessageTypes =
  typeof STDOUT |
  typeof STDERR;

export type SettingsRendererMessageTypes =
  typeof FETCH_SETTINGS |
  typeof SETTING_CHANGED;

export type StartupRendererMessageTypes =
  typeof STARTUP_PROGRESS;
