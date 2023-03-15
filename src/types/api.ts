import {
  ANALYZE_REQUESTS,
  CLEAR_ALL_ENTRIES,
  CREATE_TEST,
  DELETE_ENTRIES,
  DELETE_ENTRY,
  DOWNLOAD_CERTIFICATE,
  EXPORT_AS_HAR,
  FETCH_SUITES,
  FIND_NEXT,
  GET_IP_ADDRESS,
  GO_BACK,
  GO_FORWARD,
  INIT_FILTER_REGEX,
  IS_RECORDING,
  MARK_RELEVANT,
  REFRESH_ENTRIES,
  REFRESH_PAGE,
  SET_FILTER_REGEX,
  SET_IS_RECORDING,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW
} from '../universal/constants';

import { ViewValue } from './views';

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}

type DesktopApi = ApiForMainWindow & ApiForLoadmillBrowserView & ApiForLoadmillProxyWindow;

export type ApiForMainWindow = {
  [FIND_NEXT]: (toFind: string) => void;
  [GO_BACK]: () => void;
  [GO_FORWARD]: () => void;
  [REFRESH_PAGE]: () => void;
  [START_AGENT]: () => void;
  [STOP_AGENT]: () => void;
  [SWITCH_VIEW]: (view?: ViewValue) => void;
  [TOGGLE_MAXIMIZE_WINDOW]: () => void;
};

export type ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => void;
};

export type ApiForLoadmillProxyWindow = {
  [ANALYZE_REQUESTS]: () => void;
  [CLEAR_ALL_ENTRIES]: () => void;
  [CREATE_TEST]: (suiteId?: string) => void;
  [DELETE_ENTRIES]: (entryIds: string[]) => void;
  [DELETE_ENTRY]: (entryId: string) => void;
  [DOWNLOAD_CERTIFICATE]: () => void;
  [EXPORT_AS_HAR]: (entryIds: string[]) => void;
  [FETCH_SUITES]: () => void;
  [GET_IP_ADDRESS]: (family?: 'IPv4' | 'IPv6') => void;
  [INIT_FILTER_REGEX]: () => void;
  [IS_RECORDING]: () => void;
  [MARK_RELEVANT]: (entryIds: string[]) => void;
  [REFRESH_ENTRIES]: () => void;
  [SET_FILTER_REGEX]: (filterRegex: string) => void;
  [SET_IS_RECORDING]: (isRecording: boolean) => void;
};
