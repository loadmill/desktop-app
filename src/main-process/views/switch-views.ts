import { BrowserView, BrowserWindow } from 'electron';

import { MainMessage } from '../../types/messaging';
import { ViewName } from '../../types/views';
import { SWITCH_VIEW } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
import { setBrowserViewSize } from '../screen-size';

export const switchView = (mainWindow: BrowserWindow, view: BrowserView): void => {
  setBrowserViewSize(view, mainWindow.getBounds());
  mainWindow.setTopBrowserView(view);
};

export const subscribeToSwitchView = (
  mainWindow: BrowserWindow,
  loadmillWebView: BrowserView,
  proxyView: BrowserView,
  agentView: BrowserView,
  settingsView: BrowserView,
): void => {
  subscribeToMainProcessMessage(SWITCH_VIEW, (_event: Electron.IpcMainEvent, { view }: MainMessage['data']) => {
    switch (view) {
      case ViewName.WEB_PAGE:
        switchView(mainWindow, loadmillWebView);
        break;
      case ViewName.PROXY:
        switchView(mainWindow, proxyView);
        break;
      case ViewName.AGENT:
        switchView(mainWindow, agentView);
        break;
      case ViewName.SETTINGS:
        switchView(mainWindow, settingsView);
        break;
    }
  });
};
