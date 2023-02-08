import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
import {
  LOADMILL_VIEW_ID,
  RESIZE,
} from '../universal/constants';

import { LOADMILL_WEB_APP_ORIGIN } from './constants';
import { setWebContents } from './cookies';
import { subscribeToNavigationEvents } from './navigation-handler';
import { setOpenLinksInBrowser } from './open-links';
import { setBrowserViewSize } from './screen-size';

declare const LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY: string; // webpack hack 😒

export const createLoadmillWebView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const loadmillWebView = new BrowserView({
    webPreferences: {
      preload: LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.addBrowserView(loadmillWebView);
  setOpenLinksInBrowser(loadmillWebView.webContents);
  sendToRenderer({
    data: { loadmillViewId: loadmillWebView.webContents.id },
    type: LOADMILL_VIEW_ID,
  });

  setBrowserViewSize(loadmillWebView, mainWindow.getBounds());

  const handleWindowResize = (_e: Electron.Event) => {
    setBrowserViewSize(loadmillWebView, mainWindow.getBounds());
  };
  mainWindow.on(RESIZE, handleWindowResize);
  subscribeToNavigationEvents(loadmillWebView);

  loadmillWebView.webContents.loadURL(LOADMILL_WEB_APP_ORIGIN);

  setWebContents(loadmillWebView.webContents);

  return loadmillWebView;
};
