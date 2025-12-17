export type Settings = {
  autoUpdate?: boolean;
  onPremURL?: string;
  proxy?: ProxySettings;
};

export type ProxySettings = DeprecatedProxySettings & {
  bypassPatternsList?: string;
  enabled: boolean;
  host?: string;
  password?: string;
  port?: number;
  protocol?: 'http' | 'https';
  username?: string;
};

// Kept for backward compatibility
type DeprecatedProxySettings = {
  url: string;
};

export type ChangedSetting = {
  name: keyof Settings;
  value: Settings[keyof Settings];
};
