import { app, dialog } from 'electron';

import {
  sendFromSettingsViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { ChangedSetting, ProxySettings, Settings } from '../../types/settings';
import { FETCH_SETTINGS, SETTING_CHANGED } from '../../universal/constants';
import { defaultProxySettings } from '../../universal/default-settings';
import { subscribeToMainProcessMessage } from '../main-events';
import { relaunchDesktopApp } from '../relaunch';

import { applyProxySettings, setProxyOnStartup } from './proxy-server-setting';
import { getSettings, setSettings } from './settings-store';
import { setOnPremURLOnStartup } from './web-app-settings';

export function initSettingsOnStartup(): void {
  log.info('Initializing settings on startup');
  setProxyOnStartup();
  setOnPremURLOnStartup();
}

export const subscribeToSettingsEvents = (): void => {
  subscribeToFetchSettings();
  subscribeToSettingChangedEvent();
};

export const subscribeToSettingChangedEvent = (): void => {
  subscribeToMainProcessMessage(SETTING_CHANGED, onSettingChanged);
};

const onSettingChanged = async (
  _event: Electron.IpcMainEvent,
  { changedSetting }: { changedSetting: ChangedSetting },
) => {
  try {
    if (changedSetting) {
      const { name, value } = changedSetting;
      if (name === 'proxy') {
        await handleProxySettings(value as ProxySettings);
      } else {
        updateSettingsAndRelaunch(changedSetting);
      }
    }
  } catch (error) {
    const errorMessage = 'Failed to change setting';
    log.error(errorMessage, changedSetting, error);
    sendFromSettingsViewToRenderer({
      data: {
        error: errorMessage,
      },
      type: SETTING_CHANGED,
    });
  } finally {
    sendFromSettingsViewToRenderer({
      data: {
        settings: getSettings(),
      },
      type: FETCH_SETTINGS,
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

const updateSettingsAndRelaunch = (
  changedSetting: ChangedSetting,
) => {
  const { name, value: newSetting } = changedSetting;
  const currentSettings = getSettings();
  const hasChanged = newSetting !== currentSettings?.[name];
  if (hasChanged) {
    const response = dialog.showMessageBoxSync({
      buttons: ['Restart', 'Cancel'],
      detail: 'For the changes to take effect the app needs to be restarted',
      message: getSettingsChangeMessage(name),
      title: 'Settings',
      type: 'info',
    });
    if (response === 0) {
      setSettings({
        ...currentSettings,
        [name]: newSetting,
      });
      relaunchDesktopApp();
    }
  }
};

const getSettingsChangeMessage = (key: keyof Settings): string => {
  if (key === 'autoUpdate') {
    return 'Auto Update setting was changed';
  }
  if (key === 'onPremURL') {
    return 'On-Prem URL setting was changed';
  }
  return 'Settings were changed';
};

const handleProxySettings = async (newProxySettings: ProxySettings) => {
  if (newProxySettings) {
    const currentSettings = getSettings();
    const hasProxySettingsApplied = await applyProxySettings(
      currentSettings?.proxy || defaultProxySettings,
      newProxySettings,
    );
    setSettings({
      ...currentSettings,
      proxy: newProxySettings,
    });

    if (hasProxySettingsApplied) {
      dialog.showMessageBoxSync({
        buttons: ['Quit'],
        detail: 'For the changes to take effect the app needs to be restarted',
        message: 'The new settings were saved successfully',
        title: 'Settings',
        type: 'info',
      });
      app.quit();
    }
  }
};
