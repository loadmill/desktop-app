import {
  app,
  BrowserView,
  BrowserWindow,
} from 'electron';

import { initProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { subscribeToFindOnPageEvents } from '../find-on-page';
import { subscribeToDownloadCertificate } from '../proxy/download-certificate';
import { subscribeToFetchSuites } from '../suites';

import { createView } from './view-factory';

declare const PROXY_WINDOW_WEBPACK_ENTRY: string;
declare const PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createProxyView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const proxyView = createView(mainWindow, PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY, PROXY_WINDOW_WEBPACK_ENTRY);
  initProxyToRenderer(proxyView.webContents);
  subscribeToDownloadCertificate();
  subscribeToFindOnPageEvents(proxyView.webContents);
  subscribeToFetchSuites();
  if (!app.isPackaged) {
    proxyView.webContents.openDevTools();
  }
  return proxyView;
};
