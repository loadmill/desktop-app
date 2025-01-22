import { ProxySettings, Settings } from '../types/settings';

export const defaultProxySettings: ProxySettings = {
  enabled: false,
  url: '',
};

export const defaultAutoUpdateSetting: Settings['autoUpdate'] = true;

export const defaultSettings: Settings = {
  autoUpdate: defaultAutoUpdateSetting,
  proxy: defaultProxySettings,
};
