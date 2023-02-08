import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillBrowserView } from '../../types/api';
import {
  GENERATE_TOKEN,
  LOADMILL_DESKTOP,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
} from '../../universal/constants';
import { subscribeToLoadmillViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => sendToMain(SET_IS_USER_SIGNED_IN, { isSignedIn }),
};

const isFromMainProcess = ({ senderId }: Electron.IpcRendererEvent) => {
  return senderId === 0;
};

subscribeToLoadmillViewMessages(GENERATE_TOKEN, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: GENERATE_TOKEN });
  }
});

subscribeToLoadmillViewMessages(SAVED_TOKEN, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: SAVED_TOKEN });
  }
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
