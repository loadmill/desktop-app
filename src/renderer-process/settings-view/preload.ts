import { contextBridge } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForSettingsView } from '../../types/api';
import { SettingsRendererMessage } from '../../types/messaging';
import { ChangedSetting } from '../../types/settings';
import {
  DESKTOP_API,
  FETCH_SETTINGS,
  SETTING_CHANGED,
} from '../../universal/constants';
import { subscribeToSettingsViewMessages } from '../renderer-events';

const WINDOW_API: ApiForSettingsView = {
  [FETCH_SETTINGS]: (): void => sendToMain(FETCH_SETTINGS),
  [SETTING_CHANGED]: (changedSetting: ChangedSetting): void => sendToMain(SETTING_CHANGED, { changedSetting }),
};

subscribeToSettingsViewMessages(FETCH_SETTINGS, (_event: Electron.IpcRendererEvent, data: SettingsRendererMessage['data']) => {
  window.postMessage({ data, type: FETCH_SETTINGS });
});

subscribeToSettingsViewMessages(SETTING_CHANGED, (_event: Electron.IpcRendererEvent, data: SettingsRendererMessage['data']) => {
  window.postMessage({ data, type: SETTING_CHANGED });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
