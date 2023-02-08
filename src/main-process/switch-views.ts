import { BrowserView, BrowserWindow } from 'electron';

import { MainMessage } from '../types/messaging';
import { ViewValue } from '../types/views';
import { SWITCH_VIEW } from '../universal/constants';

import { subscribeToMainProcessMessage } from './main-events';
import { setBrowserViewSize } from './screen-size';

const switchView = (mainWindow: BrowserWindow, view: BrowserView): void => {
  setBrowserViewSize(view, mainWindow.getBounds());
  mainWindow.setTopBrowserView(view);
};

export const subscribeToSwitchView = (
  mainWindow: BrowserWindow,
  loadmillWebView: BrowserView,
  proxyView: BrowserView
): void => {
  subscribeToMainProcessMessage(SWITCH_VIEW, (_event: Electron.IpcMainEvent, { view }: MainMessage['data']) => {
    if (view === ViewValue.WEB_PAGE) {
      switchView(mainWindow, loadmillWebView);
    } else if (view === ViewValue.PROXY) {
      switchView(mainWindow, proxyView);
    }
  });
};
