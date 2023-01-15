import {
  FIND_NEXT,
  GO_BACK,
  GO_FORWARD,
  REFRESH_PAGE,
  SET_IS_USER_SIGNED_IN,
  TOGGLE_MAXIMIZE_WINDOW
} from '../universal/constants';

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}

type DesktopApi = ApiForMainWindow & ApiForLoadmillBrowserView;

export type ApiForMainWindow = {
  [FIND_NEXT]: (toFind: string) => void;
  [GO_BACK]: () => void;
  [GO_FORWARD]: () => void;
  [REFRESH_PAGE]: () => void;
  [TOGGLE_MAXIMIZE_WINDOW]: () => void;
};

export type ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => void;
};
