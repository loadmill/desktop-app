import http from 'http';
import https from 'https';

import { HttpsProxyAgent } from 'hpagent';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import { sanitizeProxySettings } from '../settings/secret-sanitization';
import { LOADMILL_WEB_APP_ORIGIN } from '../settings/web-app-settings';

export enum HttpsProxyAgentType {
  DEFAULT = 'default',
  PROXY = 'proxy',
}

export type HttpAgent = http.Agent | https.Agent | HttpsProxyAgent | null | undefined;
let agent: HttpAgent;

export const getHttpsAgent = (): HttpAgent => {
  if (!agent) {
    useDefaultHttpsAgent();
  }
  return agent;
};

const httpsAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxFreeSockets: 256,
  maxSockets: 256,
  rejectUnauthorized: false,
};

export const useProxyHttpsAgent = (proxySettings: ProxySettings): void => {
  _destroyAgent();
  log.info('Using proxy HTTPS agent', { proxySettings: sanitizeProxySettings(proxySettings) });
  agent = _createProxyHttpsAgent(proxySettings);
};

const _createProxyHttpsAgent = (proxySettings: ProxySettings): HttpsProxyAgent => {
  const proxyUrl = buildProxyUrlWithCredentials(proxySettings);
  const cleanUrl = _buildCleanProxyUrl(proxySettings);

  const hasEmbeddedCredentials = proxyUrl.includes('@');

  log.info('Proxy agent configured', {
    cleanProxyUrl: cleanUrl,
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    hasEmbeddedCredentials,
    username: proxySettings.username,
  });

  return new HttpsProxyAgent({
    ...httpsAgentOptions,
    proxy: proxyUrl,
    scheduling: 'lifo',
  });
};

/**
 * Builds a proxy URL WITH embedded credentials for hpagent (main process)
 * Format: protocol://username:password@host:port
 * hpagent natively handles Basic authentication when credentials are in the URL
 */
export const buildProxyUrlWithCredentials = (proxySettings: ProxySettings): string => {
  try {
    if (proxySettings.host && proxySettings.port) {
      const protocol = proxySettings.protocol || 'http';
      const { username, password } = proxySettings;

      if (username && password) {
        const encodedUser = encodeURIComponent(username);
        const encodedPass = encodeURIComponent(password);
        return `${protocol}://${encodedUser}:${encodedPass}@${proxySettings.host}:${proxySettings.port}`;
      }

      return `${protocol}://${proxySettings.host}:${proxySettings.port}`;
    }

    // Fall back to parsing the URL field (for backward compatibility)
    if (proxySettings.url) {
      return proxySettings.url;
    }

    log.error('Proxy settings missing required fields for credentials', { proxySettings });
    throw new Error('Proxy settings must include either (host + port) or url');
  } catch (error) {
    log.error('Error building proxy URL with credentials', { error, proxySettings });
    throw error;
  }
};

/**
 * Builds a clean proxy URL without embedded credentials (for Chromium/renderer)
 * Format: protocol://host:port
 */
const _buildCleanProxyUrl = (proxySettings: ProxySettings): string => {
  if (proxySettings.host && proxySettings.port) {
    const protocol = proxySettings.protocol || 'http';
    return `${protocol}://${proxySettings.host}:${proxySettings.port}`;
  }

  // Fall back to parsing the URL field (for backward compatibility)
  if (proxySettings.url) {
    try {
      const parsedUrl = new URL(proxySettings.url);
      // Remove username/password from URL if present
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      log.error('Failed to parse proxy URL', { error, url: proxySettings.url });
      throw new Error(`Invalid proxy URL: ${proxySettings.url}`);
    }
  }

  log.error('Proxy settings missing required fields for clean URL', { proxySettings });
  throw new Error('Proxy settings must include either (host + port) or url');
};

export const useDefaultHttpsAgent = (): void => {
  _destroyAgent();
  log.info('Using default HTTPS agent');
  agent = _createDefaultHttpsAgent();
};

const _createDefaultHttpsAgent = (): https.Agent | http.Agent => {
  if (_isLocalHttpOrigin()) {
    log.info('Using HTTP agent for development');
    return new http.Agent(httpsAgentOptions);
  }

  return new https.Agent(httpsAgentOptions);
};

const _destroyAgent = (): void => {
  if (agent) {
    log.info('Destroying HTTPS agent');
    agent.destroy();
    agent = null;
  } else {
    log.debug('No HTTPS agent to destroy');
  }
};

const _isLocalHttpOrigin = () => {
  const isLocal = LOADMILL_WEB_APP_ORIGIN.startsWith('http://');
  log.debug('Checking if origin is local HTTP', { isLocal, origin: LOADMILL_WEB_APP_ORIGIN });
  return isLocal;
};
