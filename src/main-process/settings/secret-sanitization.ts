import { ProxySettings, Settings } from '../../types/settings';

export const sanitizeProxySettings = (proxySettings: ProxySettings): ProxySettings => {
  const { password, ...sanitized } = proxySettings;
  return {
    ...sanitized,
    password: password ? '***' : undefined,
  };
};

export const sanitizeSettings = (settings: Settings): Settings => {
  if (settings.proxy) {
    return {
      ...settings,
      proxy: sanitizeProxySettings(settings.proxy),
    };
  }
  return settings;
};
