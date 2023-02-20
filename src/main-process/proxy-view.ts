import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { initProxyToRenderer } from '../inter-process-communication/proxy-to-render';
import {
  RESIZE,
} from '../universal/constants';

import { subscribeToFindOnPageEvents } from './find-on-page';
import { setOpenLinksInBrowser } from './open-links';
import { subscribeToDownloadCertificate } from './proxy/download-certificate';
import { setBrowserViewSize } from './screen-size';
import { subscribeToFetchSuites } from './suites';

declare const PROXY_WINDOW_WEBPACK_ENTRY: string;
declare const PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createProxyView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const proxyView = new BrowserView({
    webPreferences: {
      preload: PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.addBrowserView(proxyView);
  setOpenLinksInBrowser(proxyView.webContents);
  setBrowserViewSize(proxyView, mainWindow.getBounds());

  const handleWindowResize = (_e: Electron.Event) => {
    setBrowserViewSize(proxyView, mainWindow.getBounds());
  };
  mainWindow.on(RESIZE, handleWindowResize);
  proxyView.webContents.loadURL(PROXY_WINDOW_WEBPACK_ENTRY);
  proxyView.webContents.openDevTools();
  initProxyToRenderer(proxyView.webContents);
  subscribeToDownloadCertificate();
  subscribeToFindOnPageEvents(proxyView.webContents);
  subscribeToFetchSuites();
  return proxyView;
};