import {
  app,
  BrowserView,
  BrowserWindow,
} from 'electron';

import {
  LINK_TO_LOADMILL_APP,
  LOADMILL_VIEW_ID,
  RESIZE,
} from './constants';
import { sendToRenderer } from './main-to-renderer';
import { subscribeToNavigationEvents } from './navigation-handler';

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

  loadmillWebView.webContents.loadURL(LINK_TO_LOADMILL_APP);

  if (!app.isPackaged) {
    // loadmillWebView.webContents.openDevTools();
  }

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
