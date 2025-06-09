export type Settings = {
  autoUpdate?: boolean;
  onPremURL?: string;
  proxy?: ProxySettings;
};

export type ProxySettings = {
  enabled: boolean;
  url: string;
};

export type ChangedSetting = {
  name: keyof Settings;
  value: Settings[keyof Settings];
};
