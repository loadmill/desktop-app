import { contextBridge, ipcRenderer } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForLoadmillBrowserView } from '../../types/api';
import {
  LOADMILL_DESKTOP,
  RELAY_FROM_MAIN_WINDOW,
  SET_IS_USER_SIGNED_IN,
} from '../../universal/constants';

export const WINDOW_API: ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => sendToMain(SET_IS_USER_SIGNED_IN, { isSignedIn }),
};

// Handle messages relayed from main window
ipcRenderer.on(RELAY_FROM_MAIN_WINDOW, (_event, { channel, data }) => {
  window.postMessage({ data, type: channel });
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
