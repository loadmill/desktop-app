import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillProxyWindow } from '../../types/api';
import { ProxyRendererMessage } from '../../types/messaging';
import {
  CLEAR_ALL_ENTRIES,
  CREATE_TEST,
  CREATE_TEST_COMPLETE,
  DELETE_ENTRIES,
  DELETE_ENTRY,
  DESKTOP_API,
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORT_AS_HAR,
  EXPORTED_AS_HAR_SUCCESS,
  FETCH_SUITES,
  GET_IP_ADDRESS,
  INIT_FILTER_REGEX,
  IP_ADDRESS,
  IS_RECORDING,
  PROXY,
  REFRESH_ENTRIES,
  SET_FILTER_REGEX,
  SET_IS_RECORDING,
  UPDATED_ENTRIES,
  UPDATED_SUITES,
} from '../../universal/constants';
import { subscribeToProxyViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillProxyWindow = {
  [CLEAR_ALL_ENTRIES]: (): void => sendToMain(CLEAR_ALL_ENTRIES),
  [CREATE_TEST]: (suiteId?: string): void => sendToMain(CREATE_TEST, { suiteId }),
  [DELETE_ENTRIES]: (entryIds: string[]): void => sendToMain(DELETE_ENTRIES, { entryIds }),
  [DELETE_ENTRY]: (entryId: string): void => sendToMain(DELETE_ENTRY, { entryId }),
  [DOWNLOAD_CERTIFICATE]: (): void => sendToMain(DOWNLOAD_CERTIFICATE),
  [EXPORT_AS_HAR]: (entryIds: string[]): void => sendToMain(EXPORT_AS_HAR, { entryIds }),
  [FETCH_SUITES]: (): void => sendToMain(FETCH_SUITES),
  [GET_IP_ADDRESS]: (ipvFamily?: 'IPv4' | 'IPv6'): void => sendToMain(GET_IP_ADDRESS, { ipvFamily }),
  [INIT_FILTER_REGEX]: () => sendToMain(INIT_FILTER_REGEX),
  [IS_RECORDING]: (): void => sendToMain(IS_RECORDING),
  [REFRESH_ENTRIES]: (): void => sendToMain(REFRESH_ENTRIES),
  [SET_FILTER_REGEX]: (filterRegex: string): void => sendToMain(SET_FILTER_REGEX, { filterRegex }),
  [SET_IS_RECORDING]: (isRecording: boolean): void => sendToMain(SET_IS_RECORDING, { isRecording }),
};

subscribeToProxyViewMessages(CREATE_TEST_COMPLETE, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: CREATE_TEST_COMPLETE });
});

subscribeToProxyViewMessages(DOWNLOADED_CERTIFICATE_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: DOWNLOADED_CERTIFICATE_SUCCESS });
});

subscribeToProxyViewMessages(EXPORTED_AS_HAR_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: EXPORTED_AS_HAR_SUCCESS });
});

subscribeToProxyViewMessages(INIT_FILTER_REGEX, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: INIT_FILTER_REGEX });
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

subscribeToProxyViewMessages(UPDATED_SUITES, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: UPDATED_SUITES });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
