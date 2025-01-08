import { contextBridge, ipcRenderer } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForLoadmillBrowserView } from '../../types/api';
import { LoadmillViewRendererMessage } from '../../types/messaging';
import {
  GENERATE_TOKEN,
  LOADMILL_DESKTOP,
  MAGIC_TOKEN,
  RELAY_FROM_MAIN_WINDOW,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
  SHOW_AUTH_TOKEN_INPUT,
} from '../../universal/constants';
import { subscribeToLoadmillViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => sendToMain(SET_IS_USER_SIGNED_IN, { isSignedIn }),
};

// Handle messages relayed from main window
ipcRenderer.on(RELAY_FROM_MAIN_WINDOW, (_event, { channel, data }) => {
  window.postMessage({ data, type: channel }, process.env.LOADMILL_WEB_APP_ORIGIN);
});

subscribeToLoadmillViewMessages(GENERATE_TOKEN, (event: Electron.IpcRendererEvent) => {
  window.postMessage({ type: GENERATE_TOKEN }, process.env.LOADMILL_WEB_APP_ORIGIN);
});

subscribeToLoadmillViewMessages(MAGIC_TOKEN,
  (_event: Electron.IpcRendererEvent, data: LoadmillViewRendererMessage['data']) => {
    window.postMessage({ data, type: MAGIC_TOKEN }, process.env.LOADMILL_WEB_APP_ORIGIN);
  },
);

subscribeToLoadmillViewMessages(SHOW_AUTH_TOKEN_INPUT, (event: Electron.IpcRendererEvent) => {
  window.postMessage({ type: SHOW_AUTH_TOKEN_INPUT }, process.env.LOADMILL_WEB_APP_ORIGIN);
});

subscribeToLoadmillViewMessages(SAVED_TOKEN, (event: Electron.IpcRendererEvent) => {
  window.postMessage({ type: SAVED_TOKEN }, process.env.LOADMILL_WEB_APP_ORIGIN);
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
