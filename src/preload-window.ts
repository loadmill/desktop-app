import { contextBridge, ipcRenderer } from 'electron';

import {
  GENERATE_TOKEN,
  GO_BACK,
  GO_FORWARD,
  LOADMILL_DESKTOP,
  LOADMILL_VIEW_ID,
  NAVIGATION,
  REFRESH_PAGE,
  SAVED_TOKEN,
  TOGGLE_MAXIMIZE_WINDOW,
} from './constants';
import { sendToMain } from './renderer-to-main';
import { RendererMessage } from './types/messaging';

export const WINDOW_API = {
  [GO_BACK]: (): void => sendToMain(GO_BACK),
  [GO_FORWARD]: (): void => sendToMain(GO_FORWARD),
  [REFRESH_PAGE]: (): void => sendToMain(REFRESH_PAGE),
  [TOGGLE_MAXIMIZE_WINDOW]: (): void => sendToMain(TOGGLE_MAXIMIZE_WINDOW),
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

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
