import { clipboard, WebContentsView } from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
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

export const subscribeToNavigationEvents = (webView: WebContentsView): void => {
  subscribeToMainProcessMessage(REFRESH_PAGE, () => {
    webView.webContents.reload();
  });
  subscribeToMainProcessMessage(GO_BACK, () => {
    webView.webContents.navigationHistory.goBack();
  });
  subscribeToMainProcessMessage(GO_FORWARD, () => {
    webView.webContents.navigationHistory.goForward();
  });
  subscribeToMainProcessMessage(COPY_URL, async () => {
    try {
      await clipboard.writeText(webView.webContents.getURL());
    } catch (error) {
      log.error('Error copying URL to clipboard:', error);
    }
  });
  webView.webContents.on(DID_NAVIGATE_IN_PAGE, () => {
    const nav: Navigation = {
      canGoBack: webView.webContents.navigationHistory.canGoBack(),
      canGoForward: webView.webContents.navigationHistory.canGoForward(),
    };
    sendFromMainWindowToRenderer({
      data: { nav },
      type: NAVIGATION,
    });
  });
};
