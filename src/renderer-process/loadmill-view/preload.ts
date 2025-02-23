import { contextBridge } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForLoadmillBrowserView } from '../../types/api';
import { LoadmillViewRendererMessage } from '../../types/messaging';
import {
  LOADMILL_DESKTOP,
  MAGIC_TOKEN,
  SET_IS_USER_SIGNED_IN,
  SHOW_AUTH_TOKEN_INPUT,
} from '../../universal/constants';
import { subscribeToLoadmillViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillBrowserView = {
  [SET_IS_USER_SIGNED_IN]: (isSignedIn: boolean) => sendToMain(SET_IS_USER_SIGNED_IN, { isSignedIn }),
};

subscribeToLoadmillViewMessages(MAGIC_TOKEN,
  (event: Electron.IpcRendererEvent, data: LoadmillViewRendererMessage['data']) => {
    window.postMessage({ data, type: MAGIC_TOKEN });
  },
);

subscribeToLoadmillViewMessages(SHOW_AUTH_TOKEN_INPUT, (event: Electron.IpcRendererEvent) => {
  window.postMessage({ type: SHOW_AUTH_TOKEN_INPUT });
});

contextBridge.exposeInMainWorld(LOADMILL_DESKTOP, WINDOW_API);
