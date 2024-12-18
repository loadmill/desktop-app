import log from '../../log';
import { Settings } from '../../types/settings';
import { defaultSettings } from '../../universal/default-settings';
import { get, set } from '../persistence-store';
import { SETTINGS } from '../persistence-store/constants';

export const getSettings = (): Settings => {
  const settings = get<Settings>(SETTINGS) || defaultSettings;
  log.info('Loaded settings', settings);
  return settings;
};

export const setSettings = (settings: Settings): void => {
  log.info('Saving settings', settings);
  set(SETTINGS, settings);
};
