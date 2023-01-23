import { contextBridge, ipcRenderer } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillProxyWindow } from '../../types/api';
import { ProxyRendererMessage } from '../../types/messaging';
import {
  DESKTOP_API,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  PROXY,
  REFRESH_ENTRIES,
  REFRESH_FILTERS,
  SAVE_AS_HAR,
  SAVED_AS_HAR_SUCCESS,
  SET_FILTERS,
  UPDATED_ENTRIES,
  UPDATED_FILTERS,
} from '../../universal/constants';

export const WINDOW_API: ApiForLoadmillProxyWindow = {
  [DOWNLOAD_CERTIFICATE]: (): void => sendToMain(DOWNLOAD_CERTIFICATE),
  [REFRESH_ENTRIES]: (): void => sendToMain(REFRESH_ENTRIES),
  [REFRESH_FILTERS]: (): void => sendToMain(REFRESH_FILTERS),
  [SAVE_AS_HAR]: (): void => sendToMain(SAVE_AS_HAR),
  [SET_FILTERS]: (filters: string[]): void => sendToMain(SET_FILTERS, { filters }),
};

ipcRenderer.on(DOWNLOADED_CERTIFICATE_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: DOWNLOADED_CERTIFICATE_SUCCESS });
});

ipcRenderer.on(PROXY, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: PROXY });
});

ipcRenderer.on(SAVED_AS_HAR_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: SAVED_AS_HAR_SUCCESS });
});

ipcRenderer.on(UPDATED_ENTRIES, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_ENTRIES });
});

ipcRenderer.on(UPDATED_FILTERS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_FILTERS });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
