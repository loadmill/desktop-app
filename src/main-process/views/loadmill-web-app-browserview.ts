import {
  BrowserWindow,
  WebContentsView,
} from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import {
  LOADMILL_VIEW_ID,
} from '../../universal/constants';
import { setWebContents } from '../cookies';
import { subscribeToFindOnPageEvents } from '../find-on-page';
import { subscribeToNavigationEvents } from '../navigation-handler';
import { setBrowserViewSize } from '../screen-size';
import { LOADMILL_WEB_APP_ORIGIN } from '../settings/web-app-settings';

import { createView } from './view-factory';

declare const LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY: string; // webpack hack 😒

export const createLoadmillWebView = (
  mainWindow: BrowserWindow,
): WebContentsView => {
  const loadmillWebView = createView(mainWindow, {
    openDevTools: true,
    preload: LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY,
    url: LOADMILL_WEB_APP_ORIGIN,
  });
  sendFromMainWindowToRenderer({
    data: { loadmillViewId: loadmillWebView.webContents.id },
    type: LOADMILL_VIEW_ID,
  });

  setBrowserViewSize(loadmillWebView, mainWindow.getBounds());
  subscribeToNavigationEvents(loadmillWebView);
  setWebContents(loadmillWebView.webContents);
  subscribeToFindOnPageEvents(loadmillWebView.webContents);

  return loadmillWebView;
};
