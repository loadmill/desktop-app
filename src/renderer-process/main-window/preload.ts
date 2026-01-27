import { contextBridge } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForMainWindow } from '../../types/api';
import { MainWindowRendererMessage } from '../../types/messaging';
import { ViewName } from '../../types/views';
import {
  AGENT_STATUS_CHANGED,
  COPY_URL,
  DESKTOP_API,
  FIND_NEXT,
  GO_BACK,
  GO_FORWARD,
  IS_AGENT_OUTDATED,
  NAVIGATION,
  REFRESH_PAGE,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
} from '../../universal/constants';
import { subscribeToMainWindowMessages } from '../renderer-events';

export const WINDOW_API: ApiForMainWindow = {
  [COPY_URL]: () => sendToMain(COPY_URL),
  [FIND_NEXT]: (toFind: string) => sendToMain(FIND_NEXT, { toFind }),
  [GO_BACK]: () => sendToMain(GO_BACK),
  [GO_FORWARD]: () => sendToMain(GO_FORWARD),
  [REFRESH_PAGE]: () => sendToMain(REFRESH_PAGE),
  [START_AGENT]: () => sendToMain(START_AGENT),
  [STOP_AGENT]: () => sendToMain(STOP_AGENT),
  [SWITCH_VIEW]: (view?: ViewName) => sendToMain(SWITCH_VIEW, { view }),
  [TOGGLE_MAXIMIZE_WINDOW]: () => sendToMain(TOGGLE_MAXIMIZE_WINDOW),
};

subscribeToMainWindowMessages(NAVIGATION, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: NAVIGATION });
});

subscribeToMainWindowMessages(SHOW_FIND_ON_PAGE, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: SHOW_FIND_ON_PAGE });
});

subscribeToMainWindowMessages(AGENT_STATUS_CHANGED, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: AGENT_STATUS_CHANGED });
});

subscribeToMainWindowMessages(IS_AGENT_OUTDATED, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: IS_AGENT_OUTDATED });
});

subscribeToMainWindowMessages(SWITCH_VIEW, (_event: Electron.IpcRendererEvent, data: MainWindowRendererMessage['data']) => {
  window.postMessage({ data, type: SWITCH_VIEW });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
