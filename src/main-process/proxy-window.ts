import { BrowserWindow } from 'electron';

import { subscribeToDownloadCertificate } from './proxy/download-certificate';

declare const PROXY_WINDOW_WEBPACK_ENTRY: string;
declare const PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createProxyWindow = (): BrowserWindow => {
  const proxyWindow = new BrowserWindow({
    webPreferences: {
      preload: PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  proxyWindow.loadURL(PROXY_WINDOW_WEBPACK_ENTRY);
  subscribeToDownloadCertificate();
  proxyWindow.webContents.openDevTools();
  return proxyWindow;
};
