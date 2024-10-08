import { dialog } from 'electron';

import {
  sendFromSettingsViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { Settings } from '../../types/settings';
import { FETCH_SETTINGS, SAVE_SETTINGS } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
import { reloadViews } from '../views';

import { applyProxySettings, defaultProxySettings } from './proxy-server-setting';
import { getSettings, setSettings } from './settings-store';

export const subscribeToSettingsEvents = (): void => {
  subscribeToFetchSettings();
  subscribeToSaveSettingsEvent();
};

export const subscribeToSaveSettingsEvent = (): void => {
  subscribeToMainProcessMessage(SAVE_SETTINGS, onSaveSettings);
};

const onSaveSettings = async (_event: Electron.IpcMainEvent, { settings: newSettings }: { settings: Settings }) => {
  try {
    const settings = getSettings();
    if (newSettings?.proxy) {
      const proxySettingWasChanged = await applyProxySettings(
        settings?.proxy || defaultProxySettings,
        newSettings.proxy,
      );
      if (proxySettingWasChanged) {
        dialog.showMessageBoxSync({
          buttons: ['Reload'],
          detail: 'For the changes to take effect some of the tabs need to be reloaded',
          message: 'The new settings were saved successfully',
          title: 'Settings',
          type: 'info',
        });
        reloadViews();
      }
    }
    setSettings(newSettings);
  } catch (error) {
    sendFromSettingsViewToRenderer({
      data: {
        error: error.message,
      },
      type: SAVE_SETTINGS,
    });
  }
};

export const subscribeToFetchSettings = (): void => {
  subscribeToMainProcessMessage(FETCH_SETTINGS, onFetchSettings);
};

const onFetchSettings = (): void => {
  const settings = getSettings();
  sendFromSettingsViewToRenderer({
    data: {
      settings,
    },
    type: FETCH_SETTINGS,
  });
};
