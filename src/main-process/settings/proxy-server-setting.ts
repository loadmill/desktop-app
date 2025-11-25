import { app } from 'electron';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import {
  useProxyHttpsAgent,
} from '../fetch/https-agent';

import { getSettings } from './settings-store';

let proxyCredentials: { password: string, username: string; } | null = null;

interface NodeError extends Error {
  code?: string;
}

export const setProxyOnStartup = async (): Promise<void> => {
  const settings = getSettings();
  if (settings?.proxy?.enabled) {
    log.info('Setting proxy server on app start');
    _setProxyOnAppStart(settings.proxy, 'previous saved setting');
  }
};

const _setProxyOnAppStart = (proxySettings: ProxySettings, source: string): void => {
  _setProxyForRendererProcess(proxySettings, source);
  _setProxyForMainProcess(proxySettings);
};

export const applyProxySettings = async (
  currentProxySettings: ProxySettings,
  newProxySettings: ProxySettings,
): Promise<boolean> => {
  const enabledChanged = newProxySettings.enabled !== currentProxySettings.enabled;
  const settingsChanged =
    newProxySettings.host !== currentProxySettings.host ||
    newProxySettings.port !== currentProxySettings.port ||
    newProxySettings.username !== currentProxySettings.username ||
    newProxySettings.password !== currentProxySettings.password ||
    newProxySettings.protocol !== currentProxySettings.protocol;

  const { enabled } = newProxySettings;

  const isValidConfig = _hasValidProxyConfig(newProxySettings);
  log.debug('Proxy config validation', { isValidConfig, newProxySettings });

  const shouldSetNewProxy = enabled && (enabledChanged || settingsChanged) && isValidConfig;
  const shouldDisableProxy = !enabled && enabledChanged;

  log.debug('applyProxySettings decision', { enabledChanged, settingsChanged, shouldDisableProxy, shouldSetNewProxy });

  return shouldSetNewProxy || shouldDisableProxy;
};

const _hasValidProxyConfig = (proxySettings: ProxySettings): boolean => {
  const valid = !!((proxySettings.host && proxySettings.port) || proxySettings.url);
  if (!valid) {
    log.warn('Proxy config is invalid', { proxySettings });
  }
  return valid;
};

const _setProxyForRendererProcess = (proxySettings: ProxySettings, source: string) => {
  log.info('Setting proxy server for renderer process');
  const cleanProxyUrl = _buildCleanProxyUrl(proxySettings);
  log.info(`Setting proxy server on app start with ${source}`, {
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    proxyUrl: cleanProxyUrl,
  });

  // Store credentials for Chromium's app.on('login') handler
  if (proxySettings.username && proxySettings.password) {
    proxyCredentials = {
      password: proxySettings.password,
      username: proxySettings.username,
    };
    log.info('Proxy credentials stored for Chromium authentication at startup');
  }

  log.info('Applying proxy server for renderer process', {
    proxyUrl: cleanProxyUrl,
  });
  app.commandLine.appendSwitch('proxy-server', cleanProxyUrl);
  log.info('Proxy server applied for renderer process');
};

const _setProxyForMainProcess = (proxySettings: ProxySettings) => {
  log.info('Setting proxy server for main process');
  const cleanProxyUrl = _buildCleanProxyUrl(proxySettings);
  log.info({
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    proxyUrl: cleanProxyUrl,
  });
  try {
    useProxyHttpsAgent(proxySettings);
    log.info('Proxy server set for main process');
  } catch (error: unknown) {
    const err = error as NodeError;
    log.error('Error setting proxy server for main process', {
      error: err.message || error,
      errorCode: err.code,
      stack: err.stack,
    });
    throw error;
  }
};

/**
 * Builds a clean proxy URL without embedded credentials
 * Format: protocol://host:port or http=host:port;https=host:port
 */
const _buildCleanProxyUrl = (proxySettings: ProxySettings): string => {
  // If structured fields are provided, use them (preferred)
  if (proxySettings.host && proxySettings.port) {
    const protocol = proxySettings.protocol || 'http';
    return `${protocol}://${proxySettings.host}:${proxySettings.port}`;
  }

  // Fall back to parsing the URL field (for backward compatibility)
  if (proxySettings.url) {
    try {
      const parsedUrl = new URL(proxySettings.url);
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      log.error('Failed to parse proxy URL', { error, url: proxySettings.url });
      throw new Error(`Invalid proxy URL: ${proxySettings.url}`);
    }
  }

  log.error('Proxy settings missing required fields', { proxySettings });
  throw new Error('Proxy settings must include either (host + port) or url');
};

/**
 * Initialize the app.on('login') handler for Chromium proxy authentication
 * This must be called early in the app lifecycle
 */
export const initProxyAuthHandler = (): void => {
  log.info('Initializing proxy authentication handler');
  app.on('login', (event, webContents, authenticationResponseDetails, authInfo, callback) => {
    if (authInfo.isProxy && proxyCredentials) {
      log.info('Providing proxy credentials for Chromium authentication', {
        proxyHost: authInfo.host,
        proxyPort: authInfo.port,
        username: proxyCredentials.username,
      });
      event.preventDefault();
      callback(proxyCredentials.username, proxyCredentials.password);
    } else if (authInfo.isProxy && !proxyCredentials) {
      log.warn('Proxy authentication requested but no credentials available', {
        proxyHost: authInfo.host,
        proxyPort: authInfo.port,
      });
    }
  });
  log.info('Proxy authentication handler initialized');
};
