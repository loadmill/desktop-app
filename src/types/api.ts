import {
  ANALYZE_REQUESTS,
  CLEAR_ALL_ENTRIES,
  CODEGEN,
  COPY_URL,
  CREATE_TEST,
  DELETE_ENTRIES,
  DELETE_ENTRY,
  DOWNLOAD_AGENT_LOG,
  DOWNLOAD_CERTIFICATE,
  EXPORT_AS_HAR,
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
  INIT_FILTER_REGEX,
  IS_RECORDING,
  MARK_RELEVANT,
  REFRESH_ENTRIES,
  REFRESH_PAGE,
  SET_FILTER_REGEX,
  SET_IS_RECORDING,
  SET_IS_USER_SIGNED_IN,
  SET_PROFILE,
  SETTING_CHANGED,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
} from '../universal/constants';

import { IpAddressFamily } from './ip-address';
import { ChangedSetting } from './settings';
import { SuiteOption } from './suite';
import { ViewName } from './views';

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}

type DesktopApi =
  ApiForMainWindow &
  ApiForLoadmillBrowserView &
  ApiForLoadmillProxyView &
  ApiForLoadmillAgentView &
  ApiForSettingsView;

export type ApiForMainWindow = {
  [COPY_URL]: () => void;
  [FIND_NEXT]: (toFind: string) => void;
  [GO_BACK]: () => void;
  [GO_FORWARD]: () => void;
  [REFRESH_PAGE]: () => void;
  [START_AGENT]: () => void;
  [STOP_AGENT]: () => void;
  [SWITCH_VIEW]: (view?: ViewName) => void;
  [TOGGLE_MAXIMIZE_WINDOW]: () => void;
};

export type ApiForLoadmillBrowserView = {
  [CODEGEN]: (suiteId: string, flowId: string, stepId: string) => void;
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => void;
};

export type ApiForLoadmillProxyView = {
  [ANALYZE_REQUESTS]: () => void;
  [CLEAR_ALL_ENTRIES]: () => void;
  [CREATE_TEST]: (suite: SuiteOption | null) => void;
  [DELETE_ENTRIES]: (entryIds: string[]) => void;
  [DELETE_ENTRY]: (entryId: string) => void;
  [DOWNLOAD_CERTIFICATE]: () => void;
  [EXPORT_AS_HAR]: (entryIds: string[]) => void;
  [FETCH_PROFILES]: (search?: string) => void;
  [FETCH_SUITES]: (search?: string) => void;
  [GET_IP_ADDRESS]: (family?: IpAddressFamily) => void;
  [GET_PORT]: () => void;
  [GET_PROFILE]: () => void;
  [IMPORT_HAR]: () => void;
  [INIT_FILTER_REGEX]: () => void;
  [IS_RECORDING]: () => void;
  [MARK_RELEVANT]: (entryIds: string[]) => void;
  [REFRESH_ENTRIES]: () => void;
  [SET_FILTER_REGEX]: (filterRegex: string) => void;
  [SET_IS_RECORDING]: (isRecording: boolean) => void;
  [SET_PROFILE]: (profile: string) => void;
};

export type ApiForLoadmillAgentView = {
  [DOWNLOAD_AGENT_LOG]: () => void;
};

export type ApiForSettingsView = {
  [FETCH_SETTINGS]: () => void;
  [SETTING_CHANGED]: (changedSetting: ChangedSetting) => void;
};
