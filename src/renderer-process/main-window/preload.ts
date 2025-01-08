import { contextBridge, ipcRenderer } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForMainWindow } from '../../types/api';
import { MainWindowRendererMessage } from '../../types/messaging';
import { ViewName } from '../../types/views';
import {
  DESKTOP_API,
  FIND_NEXT,
  GENERATE_TOKEN,
  GO_BACK,
  GO_FORWARD,
  IS_AGENT_CONNECTED,
  IS_AGENT_OUTDATED,
  MAGIC_TOKEN,
  NAVIGATION,
  REFRESH_PAGE,
  RELAY_TO_VIEWS,
  SAVED_TOKEN,
  SHOW_AUTH_TOKEN_INPUT,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
} from '../../universal/constants';
import { subscribeToMainWindowMessages } from '../renderer-events';

export const WINDOW_API: ApiForMainWindow = {
  [FIND_NEXT]: (toFind: string) => sendToMain(FIND_NEXT, { toFind }),
  [GO_BACK]: () => sendToMain(GO_BACK),
  [GO_FORWARD]: () => sendToMain(GO_FORWARD),
  [REFRESH_PAGE]: () => sendToMain(REFRESH_PAGE),
  [START_AGENT]: () => sendToMain(START_AGENT),
  [STOP_AGENT]: () => sendToMain(STOP_AGENT),
  [SWITCH_VIEW]: (view?: ViewName) => sendToMain(SWITCH_VIEW, { view }),
  [TOGGLE_MAXIMIZE_WINDOW]: () => sendToMain(TOGGLE_MAXIMIZE_WINDOW),
};

// Instead of direct sendTo, we'll relay through main process
const sendToLoadmillView = (channel: string, data?: MainWindowRendererMessage['data']) => {
  ipcRenderer.send(RELAY_TO_VIEWS, { channel, data });
};

subscribeToMainWindowMessages(GENERATE_TOKEN, (_event: Electron.IpcRendererEvent) => {
  sendToLoadmillView(GENERATE_TOKEN);
});

subscribeToMainWindowMessages(MAGIC_TOKEN, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  sendToLoadmillView(MAGIC_TOKEN, data);
});

subscribeToMainWindowMessages(SHOW_AUTH_TOKEN_INPUT, (_event: Electron.IpcRendererEvent) => {
  sendToLoadmillView(SHOW_AUTH_TOKEN_INPUT);
});

subscribeToMainWindowMessages(SAVED_TOKEN, (_event: Electron.IpcRendererEvent) => {
  sendToLoadmillView(SAVED_TOKEN);
});

subscribeToMainWindowMessages(NAVIGATION, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: NAVIGATION });
});

subscribeToMainWindowMessages(SHOW_FIND_ON_PAGE, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: SHOW_FIND_ON_PAGE });
});

subscribeToMainWindowMessages(IS_AGENT_CONNECTED, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: IS_AGENT_CONNECTED });
});

subscribeToMainWindowMessages(IS_AGENT_OUTDATED, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: IS_AGENT_OUTDATED });
});

subscribeToMainWindowMessages(SWITCH_VIEW, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: SWITCH_VIEW });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
