import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { sendToRenderer } from '../../inter-process-communication/main-to-renderer';
import {
  LOADMILL_VIEW_ID,
} from '../../universal/constants';
import { LOADMILL_WEB_APP_ORIGIN } from '../constants';
import { setWebContents } from '../cookies';
import { subscribeToFindOnPageEvents } from '../find-on-page';
import { subscribeToNavigationEvents } from '../navigation-handler';
import { setBrowserViewSize } from '../screen-size';

import { createView } from './view-factory';

declare const LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY: string; // webpack hack 😒

export const createLoadmillWebView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const loadmillWebView = createView(mainWindow, LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY, LOADMILL_WEB_APP_ORIGIN);
  sendToRenderer({
    data: { loadmillViewId: loadmillWebView.webContents.id },
    type: LOADMILL_VIEW_ID,
  });

  setBrowserViewSize(loadmillWebView, mainWindow.getBounds());
  subscribeToNavigationEvents(loadmillWebView);
  setWebContents(loadmillWebView.webContents);
  subscribeToFindOnPageEvents(loadmillWebView.webContents);

  return loadmillWebView;
};
