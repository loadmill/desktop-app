export type Settings = {
  autoUpdate?: boolean;
  onPremURL?: string;
  proxy?: ProxySettings;
};

export type ProxySettings = {
  enabled: boolean;
  host?: string;
  password?: string;
  port?: number;
  // Deprecated: kept for backward compatibility, use structured fields below
// Structured proxy fields (preferred over url)
  protocol?: 'http' | 'https';
  url: string;
  username?: string;
};

export type ChangedSetting = {
  name: keyof Settings;
  value: Settings[keyof Settings];
};
