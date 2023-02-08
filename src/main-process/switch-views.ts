import { BrowserView, BrowserWindow, ipcMain } from 'electron';

import { MainMessage } from '../types/messaging';
import { ViewValue } from '../types/views';
import { SWITCH_VIEW } from '../universal/constants';

import { setDummyViewSize } from './dummy-browserview';

const switchView = (mainWindow: BrowserWindow, view: BrowserView): void => {
  setDummyViewSize(view, mainWindow.getBounds());
  mainWindow.setTopBrowserView(view);
};

export const subscribeToSwitchView = (
  mainWindow: BrowserWindow,
  loadmillWebView: BrowserView,
  proxyView: BrowserView
): void => {
  ipcMain.on(SWITCH_VIEW, (_event: Electron.IpcMainEvent, { view }: MainMessage['data']) => {
    if (view === ViewValue.WEB_PAGE) {
      switchView(mainWindow, loadmillWebView);
    } else if (view === ViewValue.PROXY) {
      switchView(mainWindow, proxyView);
    }
  });
};
