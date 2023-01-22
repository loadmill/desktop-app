import { contextBridge, ipcRenderer } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillProxyWindow } from '../../types/api';
import { ProxyRendererMessage } from '../../types/messaging';
import {
  DESKTOP_API,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  PROXY,
  REFRESH_FILTERS,
  SET_FILTERS,
  UPDATED_FILTERS,
} from '../../universal/constants';

export const WINDOW_API: ApiForLoadmillProxyWindow = {
  [DOWNLOAD_CERTIFICATE]: (): void => sendToMain(DOWNLOAD_CERTIFICATE),
  [REFRESH_FILTERS]: (): void => sendToMain(REFRESH_FILTERS),
  [SET_FILTERS]: (filters: string[]): void => sendToMain(SET_FILTERS, { filters }),
};

ipcRenderer.on(DOWNLOADED_CERTIFICATE_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: DOWNLOADED_CERTIFICATE_SUCCESS });
});

ipcRenderer.on(PROXY, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: PROXY });
});

ipcRenderer.on(UPDATED_FILTERS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_FILTERS });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
