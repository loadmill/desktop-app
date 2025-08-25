import { BrowserWindow, WebContentsView } from 'electron';

import { MainMessage } from '../../types/messaging';
import { ViewName } from '../../types/views';
import { SWITCH_VIEW } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
import { setBrowserViewSize } from '../screen-size';

export const switchView = (mainWindow: BrowserWindow, view: WebContentsView): void => {
  setBrowserViewSize(view, mainWindow.getBounds());
  mainWindow.contentView.addChildView(view);
};

export const subscribeToSwitchView = (
  mainWindow: BrowserWindow,
  loadmillWebView: WebContentsView,
  proxyView: WebContentsView,
  agentView: WebContentsView,
  settingsView: WebContentsView,
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
