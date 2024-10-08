import { contextBridge } from 'electron';

import {
  sendToMain,
} from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForSettingsView } from '../../types/api';
import { SettingsRendererMessage } from '../../types/messaging';
import { Settings } from '../../types/settings';
import {
  DESKTOP_API,
  FETCH_SETTINGS,
  SAVE_SETTINGS,
} from '../../universal/constants';
import { subscribeToSettingsViewMessages } from '../renderer-events';

const WINDOW_API: ApiForSettingsView = {
  [FETCH_SETTINGS]: (): void => sendToMain(FETCH_SETTINGS),
  [SAVE_SETTINGS]: (settings: Settings): void => sendToMain(SAVE_SETTINGS, { settings }),
};

subscribeToSettingsViewMessages(FETCH_SETTINGS, (_event: Electron.IpcRendererEvent, data: SettingsRendererMessage['data']) => {
  window.postMessage({ data, type: FETCH_SETTINGS });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
