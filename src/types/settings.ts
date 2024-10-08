export type Settings = {
  proxy?: ProxySettings;
};

export type ProxySettings = {
  enabled: boolean;
  url: string;
};
