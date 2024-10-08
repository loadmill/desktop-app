import { app, session } from 'electron';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import {
  useDefaultHttpsAgent,
  useProxyHttpsAgent,
} from '../fetch/https-agent';

import { getSettings } from './settings-store';

export const defaultProxySettings: ProxySettings = {
  enabled: false,
  url: '',
};

export const setProxyOnStartup = async (): Promise<void> => {
  if (process.env.PROXY_SERVER) {
    _setProxyOnAppStart(process.env.PROXY_SERVER, 'env var PROXY_SERVER');
    return;
  }
  const settings = getSettings();
  if (settings?.proxy?.enabled) {
    _setProxyOnAppStart(settings.proxy.url, 'previous saved setting');
  }
};

const _setProxyOnAppStart = (proxyUrl: string, source: string): void => {
  log.info(`Setting proxy server on app start with ${source}`, { proxyUrl });
  app.commandLine.appendSwitch('proxy-server', proxyUrl);
  _setProxyForMainProcess(proxyUrl);
};

export const applyProxySettings = async (
  currentProxySettings: ProxySettings,
  newProxySettings: ProxySettings,
): Promise<boolean> => {
  let wasChanged = false;
  const enabledChanged = newProxySettings.enabled !== currentProxySettings.enabled;
  const urlChanged = newProxySettings.enabled && newProxySettings.url !== currentProxySettings.url;

  const { enabled, url } = newProxySettings;

  if (enabled) {
    if (enabledChanged || urlChanged) {
      await _setProxy(url);
      wasChanged = true;
    }
  } else {
    if (enabledChanged) {
      await _disableProxy();
      wasChanged = true;
    }
  }

  return wasChanged;
};

const _setProxy = async (proxyUrl: string) => {
  _setProxyForMainProcess(proxyUrl);
  await _setProxyForRendererProcess(proxyUrl);
};

const _disableProxy = async () => {
  _disableProxyForMainProcess();
  await _disableProxyForRendererProcess();
};

const _setProxyForRendererProcess = async (proxyUrl: string) => {
  log.info('Setting proxy server for renderer process', { proxyUrl });
  try {
    await session.defaultSession.setProxy({
      proxyRules: proxyUrl,
    });
  } catch (error) {
    log.error('Error setting proxy server for renderer process', { error });
    throw error;
  }
};

const _disableProxyForRendererProcess = async () => {
  log.info('Disabling proxy setting for renderer process');
  try {
    await session.defaultSession.setProxy({
      proxyRules: null,
    });
  } catch (error) {
    log.error('Error disabling proxy setting for renderer process', { error });
    throw error;
  }
};

const _setProxyForMainProcess = (proxyUrl: string) => {
  log.info('Setting proxy server for main process', { proxyUrl });
  try {
    useProxyHttpsAgent(proxyUrl);
  } catch (error) {
    log.error('Error setting proxy server for main process', { error });
    throw error;
  }
};

const _disableProxyForMainProcess = () => {
  log.info('Disabling proxy settings for main process');
  try {
    useDefaultHttpsAgent();
  } catch (error) {
    log.error('Error disabling proxy setting for main process', { error });
    throw error;
  }
};
