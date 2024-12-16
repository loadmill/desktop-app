export type Settings = {
  autoUpdate?: boolean;
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
