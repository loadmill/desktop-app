import http from 'http';
import https from 'https';

import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import { sanitizeProxySettings } from '../settings/secret-sanitization';

export type HttpsAgent = https.Agent | HttpsProxyAgent | null | undefined;
export type HttpAgent = http.Agent | HttpProxyAgent | null | undefined;
let httpsAgent: HttpsAgent;
let httpAgent: HttpAgent;

export const getHttpsAgent = (): HttpsAgent => {
  if (!httpsAgent) {
    useDefaultHttpsAgent();
  }
  return httpsAgent;
};

export const getHttpAgent = (): HttpAgent => {
  if (!httpAgent) {
    useDefaultHttpsAgent();
  }
  return httpAgent;
};

const httpsAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxFreeSockets: 256,
  maxSockets: 256,
  rejectUnauthorized: false,
};

const httpAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxFreeSockets: 256,
  maxSockets: 256,
  rejectUnauthorized: false,
};

export const useProxyHttpsAgent = (proxySettings: ProxySettings): void => {
  _destroyHttpsAgent();
  log.info('Using proxy HTTPS agent', { proxySettings: sanitizeProxySettings(proxySettings) });
  httpsAgent = _createProxyHttpsAgent(proxySettings);
};

export const useProxyHttpAgent = (proxySettings: ProxySettings): void => {
  _destroyHttpAgent();
  log.info('Using proxy HTTP agent', { proxySettings: sanitizeProxySettings(proxySettings) });
  httpAgent = _createProxyHttpAgent(proxySettings);
};

const _createProxyHttpsAgent = (proxySettings: ProxySettings): HttpsProxyAgent => {
  const proxyUrl = buildProxyUrlWithCredentials(proxySettings);
  const cleanUrl = _buildCleanProxyUrl(proxySettings);

  const hasEmbeddedCredentials = proxyUrl.includes('@');

  log.info('Proxy https agent configured', {
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

const _createProxyHttpAgent = (proxySettings: ProxySettings): HttpProxyAgent => {
  const proxyUrl = buildProxyUrlWithCredentials(proxySettings);
  const cleanUrl = _buildCleanProxyUrl(proxySettings);

  const hasEmbeddedCredentials = proxyUrl.includes('@');

  log.info('Proxy http agent configured', {
    cleanProxyUrl: cleanUrl,
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    hasEmbeddedCredentials,
    username: proxySettings.username,
  });

  return new HttpProxyAgent({
    ...httpAgentOptions,
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
  _destroyHttpsAgent();
  log.info('Using default HTTPS agent');
  httpsAgent = _createDefaultHttpsAgent();
};

export const useDefaultHttpAgent = (): void => {
  _destroyHttpAgent();
  log.info('Using default HTTP agent');
  httpAgent = _createDefaultHttpAgent();
};

const _createDefaultHttpsAgent = (): https.Agent => {
  return new https.Agent(httpsAgentOptions);
};

const _createDefaultHttpAgent = (): http.Agent => {
  return new http.Agent(httpAgentOptions);
};

const _destroyHttpsAgent = (): void => {
  if (httpsAgent) {
    log.info('Destroying HTTPS agent');
    httpsAgent.destroy();
    httpsAgent = null;
  } else {
    log.debug('No HTTPS agent to destroy');
  }
};

const _destroyHttpAgent = (): void => {
  if (httpAgent) {
    log.info('Destroying HTTP agent');
    httpAgent.destroy();
    httpAgent = null;
  } else {
    log.debug('No HTTP agent to destroy');
  }
};
