import { Settings } from '../../types/settings';
import { get, set } from '../persistence-store';
import { SETTINGS } from '../persistence-store/constants';

export const getSettings = (): Settings => {
  const settings = get<Settings>(SETTINGS);
  return settings;
};

export const setSettings = (settings: Settings): void => {
  set(SETTINGS, settings);
};
