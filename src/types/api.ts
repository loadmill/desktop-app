import {
  CLEAR_ALL_ENTRIES,
  DOWNLOAD_CERTIFICATE,
  FIND_NEXT,
  GO_BACK,
  GO_FORWARD,
  IS_RECORDING,
  REFRESH_ENTRIES,
  REFRESH_FILTERS,
  REFRESH_PAGE,
  SAVE_AS_HAR,
  SET_FILTERS,
  SET_IS_RECORDING,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
  TOGGLE_MAXIMIZE_WINDOW
} from '../universal/constants';

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
  [TOGGLE_MAXIMIZE_WINDOW]: () => void;
};

export type ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => void;
};

export type ApiForLoadmillProxyWindow = {
  [CLEAR_ALL_ENTRIES]: () => void;
  [DOWNLOAD_CERTIFICATE]: () => void;
  [IS_RECORDING]: () => void;
  [REFRESH_ENTRIES]: () => void;
  [REFRESH_FILTERS]: () => void;
  [SAVE_AS_HAR]: () => void;
  [SET_FILTERS]: (filters: string[]) => void;
  [SET_IS_RECORDING]: (isRecording: boolean) => void;
};
