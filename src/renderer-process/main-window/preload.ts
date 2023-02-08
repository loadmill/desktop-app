import { contextBridge, ipcRenderer } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForMainWindow } from '../../types/api';
import { RendererMessage } from '../../types/messaging';
import { ViewValue } from '../../types/views';
import {
  DESKTOP_API,
  FIND_NEXT,
  GENERATE_TOKEN,
  GO_BACK,
  GO_FORWARD,
  IS_AGENT_CONNECTED,
  LOADMILL_VIEW_ID,
  NAVIGATION,
  REFRESH_PAGE,
  SAVED_TOKEN,
  SHOW_FIND_ON_PAGE,
  START_AGENT,
  STOP_AGENT,
  SWITCH_VIEW,
  TOGGLE_MAXIMIZE_WINDOW,
} from '../../universal/constants';

export const WINDOW_API: ApiForMainWindow = {
  [FIND_NEXT]: (toFind: string) => sendToMain(FIND_NEXT, { toFind }),
  [GO_BACK]: () => sendToMain(GO_BACK),
  [GO_FORWARD]: () => sendToMain(GO_FORWARD),
  [REFRESH_PAGE]: () => sendToMain(REFRESH_PAGE),
  [START_AGENT]: () => sendToMain(START_AGENT),
  [STOP_AGENT]: () => sendToMain(STOP_AGENT),
  [SWITCH_VIEW]: (view?: ViewValue) => sendToMain(SWITCH_VIEW, { view }),
  [TOGGLE_MAXIMIZE_WINDOW]: () => sendToMain(TOGGLE_MAXIMIZE_WINDOW),
};

let loadmillViewId = 3;

const isFromMainProcess = ({ senderId }: Electron.IpcRendererEvent) => {
  return senderId === 0;
};

ipcRenderer.on(GENERATE_TOKEN, async (event: Electron.IpcRendererEvent) => {
  if (isFromMainProcess(event)) {
    ipcRenderer.sendTo(loadmillViewId, GENERATE_TOKEN);
  }
});

ipcRenderer.on(LOADMILL_VIEW_ID, async (_event: Electron.IpcRendererEvent, data: RendererMessage['data']) => {
  loadmillViewId = data[LOADMILL_VIEW_ID];
});

ipcRenderer.on(SAVED_TOKEN, async (event: Electron.IpcRendererEvent) => {
  if (isFromMainProcess(event)) {
    ipcRenderer.sendTo(loadmillViewId, SAVED_TOKEN);
  }
});

ipcRenderer.on(NAVIGATION, async (_event: Electron.IpcRendererEvent, data: RendererMessage['data']) => {
  window.postMessage({ data, type: NAVIGATION });
});

ipcRenderer.on(SHOW_FIND_ON_PAGE, async (_event: Electron.IpcRendererEvent, data: RendererMessage['data']) => {
  window.postMessage({ data, type: SHOW_FIND_ON_PAGE });
});

ipcRenderer.on(IS_AGENT_CONNECTED, async (_event: Electron.IpcRendererEvent, data: RendererMessage['data']) => {
  window.postMessage({ data, type: IS_AGENT_CONNECTED });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
