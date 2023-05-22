import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { initProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { subscribeToFindOnPageEvents } from '../find-on-page';
import { subscribeToDownloadCertificate } from '../proxy/download-certificate';
import { subscribeToFetchSuites } from '../suites';

import { createView } from './view-factory';

declare const PROXY_VIEW_WEBPACK_ENTRY: string;
declare const PROXY_VIEW_PRELOAD_WEBPACK_ENTRY: string;

export const createProxyView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const proxyView = createView(mainWindow, {
    openDevTools: true,
    preload: PROXY_VIEW_PRELOAD_WEBPACK_ENTRY,
    url: PROXY_VIEW_WEBPACK_ENTRY,
  });
  initProxyToRenderer(proxyView.webContents);
  subscribeToDownloadCertificate();
  subscribeToFindOnPageEvents(proxyView.webContents);
  subscribeToFetchSuites();
  return proxyView;
};
