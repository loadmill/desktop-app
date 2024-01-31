import { BrowserView } from 'electron';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
import { Navigation } from '../types/navigation';
import {
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
  webView.webContents.on(DID_NAVIGATE_IN_PAGE, () => {
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
