import { BrowserView, BrowserWindow } from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { View, ViewName } from '../../types/views';
import { RELAY_FROM_MAIN_WINDOW, RELAY_TO_VIEWS, SWITCH_VIEW } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { createAgentView } from './agent-view';
import { createLoadmillWebView } from './loadmill-web-app-browserview';
import { createProxyView } from './proxy-view';
import { createSettingsView } from './settings-view';
import { subscribeToSwitchView, switchView } from './switch-views';

let mainWindow: BrowserWindow;
const views: View[] = [];

export const initializeViews = (window: BrowserWindow): void => {
  mainWindow = window;
  const agentView = createAgentView(mainWindow);
  const proxyView = createProxyView(mainWindow);
  const loadmillWebView = createLoadmillWebView(mainWindow);
  const settingsView = createSettingsView(mainWindow);
  setViews(loadmillWebView, proxyView, agentView, settingsView);
  mainWindow.setTopBrowserView(loadmillWebView);
  subscribeToSwitchView(mainWindow, loadmillWebView, proxyView, agentView, settingsView);
  subscribeToMainProcessMessage(RELAY_TO_VIEWS, (_, data) => {
    loadmillWebView.webContents.send(RELAY_FROM_MAIN_WINDOW, data);
  });
};

const setViews = (
  loadmillWebView: BrowserView,
  proxyView: BrowserView,
  agentView: BrowserView,
  settingsView: BrowserView,
) => {
  appendView(agentView, ViewName.AGENT);
  appendView(proxyView, ViewName.PROXY);
  appendView(loadmillWebView, ViewName.WEB_PAGE);
  appendView(settingsView, ViewName.SETTINGS);
};

const appendView = (view: BrowserView, name: ViewName) => {
  views.push({ id: view.webContents.id, name, view });
};

export const switchToAgentView = (): void => {
  const agentView = views.find((view) => view.name === ViewName.AGENT);
  if (agentView) {
    switchView(mainWindow, agentView.view);
    sendFromMainWindowToRenderer({
      data: { view: ViewName.AGENT },
      type: SWITCH_VIEW,
    });
  } else {
    log.error('Agent view not found');
  }
};

export const switchToSettingsView = (): void => {
  const settingsView = views.find((view) => view.name === ViewName.SETTINGS);
  if (settingsView) {
    switchView(mainWindow, settingsView.view);
    sendFromMainWindowToRenderer({
      data: { view: ViewName.SETTINGS },
      type: SWITCH_VIEW,
    });
  } else {
    log.error('Settings view not found');
  }
};

export const reloadViews = (): void => {
  views.forEach((view) => {
    view.view.webContents.reload();
  });
};

export const getViewByName = (name: ViewName): BrowserView | undefined => {
  return views.find((view) => view.name === name)?.view;
};
