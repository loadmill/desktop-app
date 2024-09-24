import { contextBridge } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForLoadmillProxyView } from '../../types/api';
import { ProxyRendererMessage } from '../../types/messaging';
import { SuiteOption } from '../../types/suite';
import {
  ANALYZE_REQUESTS,
  ANALYZE_REQUESTS_COMPLETE,
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
  GET_PORT,
  IMPORT_HAR,
  IMPORT_HAR_IS_IN_PROGRESS,
  INIT_FILTER_REGEX,
  IP_ADDRESS,
  IS_RECORDING,
  MARK_RELEVANT,
  ONLINE,
  PORT,
  PROXY,
  REFRESH_ENTRIES,
  SET_FILTER_REGEX,
  SET_IS_RECORDING,
  UPDATED_ENTRIES,
  UPDATED_SUITES,
} from '../../universal/constants';
import { subscribeToProxyViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillProxyView = {
  [ANALYZE_REQUESTS]: (): void => sendToMain(ANALYZE_REQUESTS),
  [CLEAR_ALL_ENTRIES]: (): void => sendToMain(CLEAR_ALL_ENTRIES),
  [CREATE_TEST]: (suite: SuiteOption): void => sendToMain(CREATE_TEST, { suite }),
  [DELETE_ENTRIES]: (entryIds: string[]): void => sendToMain(DELETE_ENTRIES, { entryIds }),
  [DELETE_ENTRY]: (entryId: string): void => sendToMain(DELETE_ENTRY, { entryId }),
  [DOWNLOAD_CERTIFICATE]: (): void => sendToMain(DOWNLOAD_CERTIFICATE),
  [EXPORT_AS_HAR]: (entryIds: string[]): void => sendToMain(EXPORT_AS_HAR, { entryIds }),
  [FETCH_SUITES]: (search?: string): void => sendToMain(FETCH_SUITES, { search }),
  [GET_IP_ADDRESS]: (ipvFamily?: 'IPv4' | 'IPv6'): void => sendToMain(GET_IP_ADDRESS, { ipvFamily }),
  [GET_PORT]: (): void => sendToMain(GET_PORT),
  [IMPORT_HAR]: (): void => sendToMain(IMPORT_HAR),
  [INIT_FILTER_REGEX]: () => sendToMain(INIT_FILTER_REGEX),
  [IS_RECORDING]: (): void => sendToMain(IS_RECORDING),
  [MARK_RELEVANT]: (entryIds: string[]): void => sendToMain(MARK_RELEVANT, { entryIds }),
  [REFRESH_ENTRIES]: (): void => sendToMain(REFRESH_ENTRIES),
  [SET_FILTER_REGEX]: (filterRegex: string): void => sendToMain(SET_FILTER_REGEX, { filterRegex }),
  [SET_IS_RECORDING]: (isRecording: boolean): void => sendToMain(SET_IS_RECORDING, { isRecording }),
};

subscribeToProxyViewMessages(ANALYZE_REQUESTS_COMPLETE, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: ANALYZE_REQUESTS_COMPLETE });
});

subscribeToProxyViewMessages(CREATE_TEST_COMPLETE, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: CREATE_TEST_COMPLETE });
});

subscribeToProxyViewMessages(DOWNLOADED_CERTIFICATE_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: DOWNLOADED_CERTIFICATE_SUCCESS });
});

subscribeToProxyViewMessages(EXPORTED_AS_HAR_SUCCESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: EXPORTED_AS_HAR_SUCCESS });
});

subscribeToProxyViewMessages(IMPORT_HAR, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: IMPORT_HAR });
});

subscribeToProxyViewMessages(IMPORT_HAR_IS_IN_PROGRESS, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: IMPORT_HAR_IS_IN_PROGRESS });
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

subscribeToProxyViewMessages(PORT, (_event: Electron.IpcRendererEvent, data: ProxyRendererMessage['data']) => {
  window.postMessage({ data, type: PORT });
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

window.addEventListener(ONLINE, () => {
  WINDOW_API.getIpAddress();
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
