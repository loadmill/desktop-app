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

declare const LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY: string; // webpack hack 😒

const TITLE_BAR_HEIGHT = 44;

export const createLoadmillWebView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const loadmillWebView = new BrowserView({
    webPreferences: {
      preload: LOADMILL_VIEW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.setBrowserView(loadmillWebView);
  setOpenLinksInBrowser(loadmillWebView.webContents);
  sendToRenderer({
    data: { loadmillViewId: loadmillWebView.webContents.id },
    type: LOADMILL_VIEW_ID,
  });

  setLoadmillWebviewSize(loadmillWebView, mainWindow.getBounds());

  const handleWindowResize = (_e: Electron.Event) => {
    setLoadmillWebviewSize(loadmillWebView, mainWindow.getBounds());
  };
  mainWindow.on(RESIZE, handleWindowResize);
  subscribeToNavigationEvents(loadmillWebView);

  loadmillWebView.webContents.loadURL(LOADMILL_WEB_APP_ORIGIN);

  setWebContents(loadmillWebView.webContents);

  return loadmillWebView;
};

const setLoadmillWebviewSize = (view: BrowserView, bounds: Electron.Rectangle) => {
  view.setBounds({
    height: bounds.height - TITLE_BAR_HEIGHT,
    width: bounds.width,
    x: 0,
    y: TITLE_BAR_HEIGHT,
  });
};
