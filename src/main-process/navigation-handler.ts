import { BrowserView, ipcMain } from 'electron';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
import { Navigation } from '../types/navigation';
import { DID_NAVIGATE_IN_PAGE, GO_BACK, GO_FORWARD, NAVIGATION, REFRESH_PAGE } from '../universal/constants';

export const subscribeToNavigationEvents = (webView: BrowserView): void => {
  ipcMain.on(REFRESH_PAGE, (_event: Electron.IpcMainEvent) => {
    webView.webContents.reload();
  });
  ipcMain.on(GO_BACK, (_event: Electron.IpcMainEvent) => {
    webView.webContents.goBack();
  });
  ipcMain.on(GO_FORWARD, (_event: Electron.IpcMainEvent) => {
    webView.webContents.goForward();
  });
  webView.webContents.on(DID_NAVIGATE_IN_PAGE, (
    _event: Event,
    _url: string,
    _isMainFrame: boolean,
    _frameProcessId: number,
    _frameRoutingId: number,
  ) => {
    const nav: Navigation = {
      canGoBack: webView.webContents.canGoBack(),
      canGoForward: webView.webContents.canGoForward(),
    };
    sendToRenderer({
      data: { nav },
      type: NAVIGATION,
    });
  });
};
