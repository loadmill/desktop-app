import { app, session } from 'electron';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import {
  useDefaultHttpsAgent,
  useProxyHttpsAgent,
} from '../fetch/https-agent';

import { getSettings } from './settings-store';

let proxyCredentials: { password: string, username: string; } | null = null;

interface NodeError extends Error {
  code?: string;
}

export const setProxyOnStartup = async (): Promise<void> => {
  if (process.env.PROXY_SERVER) {
    const proxySettings = _parseProxyUrlToSettings(process.env.PROXY_SERVER);
    _setProxyOnAppStart(proxySettings, 'env var PROXY_SERVER');
    return;
  }
  const settings = getSettings();
  if (settings?.proxy?.enabled) {
    _setProxyOnAppStart(settings.proxy, 'previous saved setting');
  }
};

const _setProxyOnAppStart = (proxySettings: ProxySettings, source: string): void => {
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

  app.commandLine.appendSwitch('proxy-server', cleanProxyUrl);
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

  let hasApplied = false;

  const shouldSetNewProxy = enabled && (enabledChanged || settingsChanged) && _hasValidProxyConfig(newProxySettings);
  const shouldDisableProxy = !enabled && enabledChanged;

  if (shouldSetNewProxy) {
    await _setProxy(newProxySettings);
    hasApplied = true;
  } else if (shouldDisableProxy) {
    await _disableProxy();
    hasApplied = true;
  }

  return hasApplied;
};

const _hasValidProxyConfig = (proxySettings: ProxySettings): boolean => {
  return !!((proxySettings.host && proxySettings.port) || proxySettings.url);
};

const _setProxy = async (proxySettings: ProxySettings) => {
  _setProxyForMainProcess(proxySettings);
  await _setProxyForRendererProcess(proxySettings);
};

const _disableProxy = async () => {
  _disableProxyForMainProcess();
  await _disableProxyForRendererProcess();
};

const _setProxyForRendererProcess = async (proxySettings: ProxySettings) => {
  const cleanProxyUrl = _buildCleanProxyUrl(proxySettings);
  log.info('Setting proxy server for renderer process', {
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    proxyUrl: cleanProxyUrl,
  });
  try {
    // Store credentials for app.on('login') handler
    if (proxySettings.username && proxySettings.password) {
      proxyCredentials = {
        password: proxySettings.password,
        username: proxySettings.username,
      };
      log.info('Proxy credentials stored for Chromium authentication');
    } else {
      proxyCredentials = null;
    }

    await session.defaultSession.setProxy({
      proxyRules: cleanProxyUrl,
    });
  } catch (error: unknown) {
    const err = error as NodeError;
    log.error('Error setting proxy server for renderer process', {
      error: err.message || error,
      errorCode: err.code,
      stack: err.stack,
    });
    throw error;
  }
};

const _disableProxyForRendererProcess = async () => {
  log.info('Disabling proxy setting for renderer process');
  try {
    proxyCredentials = null;
    await session.defaultSession.setProxy({
      proxyRules: null,
    });
  } catch (error: unknown) {
    const err = error as NodeError;
    log.error('Error disabling proxy setting for renderer process', {
      error: err.message || error,
      errorCode: err.code,
      stack: err.stack,
    });
    throw error;
  }
};

const _setProxyForMainProcess = (proxySettings: ProxySettings) => {
  const cleanProxyUrl = _buildCleanProxyUrl(proxySettings);
  log.info('Setting proxy server for main process', {
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    proxyUrl: cleanProxyUrl,
  });
  try {
    useProxyHttpsAgent(proxySettings);
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

const _disableProxyForMainProcess = () => {
  log.info('Disabling proxy settings for main process');
  try {
    useDefaultHttpsAgent();
  } catch (error: unknown) {
    const err = error as NodeError;
    log.error('Error disabling proxy setting for main process', {
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

  throw new Error('Proxy settings must include either (host + port) or url');
};

/**
 * Parses a proxy URL string (possibly with embedded credentials) into ProxySettings
 * Supports formats:
 * - http://host:port
 * - http://username:password@host:port
 * - https://host:port
 */
const _parseProxyUrlToSettings = (proxyUrl: string): ProxySettings => {
  try {
    const parsedUrl = new URL(proxyUrl);
    const settings: ProxySettings = {
      enabled: true,
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port, 10),
      protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https',
      url: proxyUrl,
    };

    if (parsedUrl.username) {
      settings.username = decodeURIComponent(parsedUrl.username);
    }
    if (parsedUrl.password) {
      settings.password = decodeURIComponent(parsedUrl.password);
    }

    return settings;
  } catch (error) {
    log.error('Failed to parse proxy URL', { error, proxyUrl });
    throw new Error(`Invalid proxy URL: ${proxyUrl}`);
  }
};

/**
 * Initialize the app.on('login') handler for Chromium proxy authentication
 * This must be called early in the app lifecycle
 */
export const initProxyAuthHandler = (): void => {
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
