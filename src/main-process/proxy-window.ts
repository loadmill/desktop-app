import { BrowserWindow } from 'electron';

declare const PROXY_WINDOW_WEBPACK_ENTRY: string;
declare const PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createProxyWindow = (): BrowserWindow => {
  const proxyWindow = new BrowserWindow({
    webPreferences: {
      preload: PROXY_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  proxyWindow.loadURL(PROXY_WINDOW_WEBPACK_ENTRY);
  proxyWindow.webContents.openDevTools();
  return proxyWindow;
};
