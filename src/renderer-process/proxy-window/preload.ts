import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillProxyWindow } from '../../types/api';
import { ProxyRendererMessage } from '../../types/messaging';
import {
  CLEAR_ALL_ENTRIES,
  DELETE_ENTRY,
  DESKTOP_API,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORT_AS_HAR,
  EXPORTED_AS_HAR_SUCCESS,
  FETCH_SUITES,
  GET_IP_ADDRESS,
  IP_ADDRESS,
  IS_RECORDING,
  PROXY,
  REFRESH_ENTRIES,
  REFRESH_FILTERS,
  SET_FILTERS,
  SET_IS_RECORDING,
  UPDATED_ENTRIES,
  UPDATED_FILTERS,
  UPDATED_SUITES,
} from '../../universal/constants';
import { subscribeToProxyViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillProxyWindow = {
  [CLEAR_ALL_ENTRIES]: (): void => sendToMain(CLEAR_ALL_ENTRIES),
  [DELETE_ENTRY]: (entryId: string): void => sendToMain(DELETE_ENTRY, { entryId }),
  [DOWNLOAD_CERTIFICATE]: (): void => sendToMain(DOWNLOAD_CERTIFICATE),
  [EXPORT_AS_HAR]: (): void => sendToMain(EXPORT_AS_HAR),
  [FETCH_SUITES]: (): void => sendToMain(FETCH_SUITES),
  [GET_IP_ADDRESS]: (ipvFamily?: 'IPv4' | 'IPv6'): void => sendToMain(GET_IP_ADDRESS, { ipvFamily }),
  [IS_RECORDING]: (): void => sendToMain(IS_RECORDING),
  [REFRESH_ENTRIES]: (): void => sendToMain(REFRESH_ENTRIES),
  [REFRESH_FILTERS]: (): void => sendToMain(REFRESH_FILTERS),
  [SET_FILTERS]: (filters: string[]): void => sendToMain(SET_FILTERS, { filters }),
  [SET_IS_RECORDING]: (isRecording: boolean): void => sendToMain(SET_IS_RECORDING, { isRecording }),
};

subscribeToProxyViewMessages(DOWNLOADED_CERTIFICATE_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: DOWNLOADED_CERTIFICATE_SUCCESS });
});

subscribeToProxyViewMessages(EXPORTED_AS_HAR_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: EXPORTED_AS_HAR_SUCCESS });
});

subscribeToProxyViewMessages(IP_ADDRESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: IP_ADDRESS });
});

subscribeToProxyViewMessages(IS_RECORDING, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: IS_RECORDING });
});

subscribeToProxyViewMessages(PROXY, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: PROXY });
});

subscribeToProxyViewMessages(UPDATED_ENTRIES, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_ENTRIES });
});

subscribeToProxyViewMessages(UPDATED_FILTERS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_FILTERS });
});

subscribeToProxyViewMessages(UPDATED_SUITES, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_SUITES });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
