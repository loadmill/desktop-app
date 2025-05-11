import { BrowserView, clipboard } from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import { Navigation } from '../types/navigation';
import {
  COPY_URL,
  DID_NAVIGATE_IN_PAGE,
  GO_BACK,
  GO_FORWARD,
  NAVIGATION,
  REFRESH_PAGE,
} from '../universal/constants';

import { subscribeToMainProcessMessage } from './main-events';

export const subscribeToNavigationEvents = (webView: BrowserView): void => {
  subscribeToMainProcessMessage(REFRESH_PAGE, () => {
    webView.webContents.reload();
  });
  subscribeToMainProcessMessage(GO_BACK, () => {
    webView.webContents.goBack();
  });
  subscribeToMainProcessMessage(GO_FORWARD, () => {
    webView.webContents.goForward();
  });
  subscribeToMainProcessMessage(COPY_URL, () => {
    clipboard.writeText(webView.webContents.getURL());
  });
  webView.webContents.on(DID_NAVIGATE_IN_PAGE, () => {
    const nav: Navigation = {
      canGoBack: webView.webContents.canGoBack(),
      canGoForward: webView.webContents.canGoForward(),
    };
    sendFromMainWindowToRenderer({
      data: { nav },
      type: NAVIGATION,
    });
  });
};
