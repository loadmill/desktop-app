import { contextBridge, ipcRenderer } from 'electron';

import {
  GENERATE_TOKEN,
  LOADMILL_DESKTOP,
  NEW_TOKEN,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
} from '../constants';
import { sendToMain } from '../renderer-to-main';

export const WINDOW_API = {
  [NEW_TOKEN]: (token: string): void => sendToMain(NEW_TOKEN, { token }),
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean): void => sendToMain(SET_IS_USER_SIGNED_IN, { isSignedIn }),
};

const isFromMainProcess = ({ senderId }: Electron.IpcRendererEvent) => {
  return senderId === 0;
};

ipcRenderer.on(GENERATE_TOKEN, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: GENERATE_TOKEN });
  }
});

ipcRenderer.on(SAVED_TOKEN, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: SAVED_TOKEN });
  }
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
