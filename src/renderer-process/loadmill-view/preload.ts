import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillBrowserView } from '../../types/api';
import { LoadmillViewRendererMessage } from '../../types/messaging';
import {
  GENERATE_TOKEN,
  LOADMILL_DESKTOP,
  MAGIC_TOKEN,
  SAVED_TOKEN,
  SET_IS_USER_SIGNED_IN,
  SHOW_AUTH_TOKEN_INPUT,
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

subscribeToLoadmillViewMessages(MAGIC_TOKEN,
  (event: Electron.IpcRendererEvent, data: LoadmillViewRendererMessage['data']) => {
    if (!isFromMainProcess(event)) {
      window.postMessage({ data, type: MAGIC_TOKEN });
    }
  },
);

subscribeToLoadmillViewMessages(SHOW_AUTH_TOKEN_INPUT, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: SHOW_AUTH_TOKEN_INPUT });
  }
});

subscribeToLoadmillViewMessages(SAVED_TOKEN, (event: Electron.IpcRendererEvent) => {
  if (!isFromMainProcess(event)) {
    window.postMessage({ type: SAVED_TOKEN });
  }
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
