import http from 'http';
import https from 'https';

import { HttpsProxyAgent } from 'hpagent';

import log from '../../log';
import type { ProxySettings } from '../../types/settings';
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
  log.info('Using proxy HTTPS agent', { proxySettings: _sanitizeProxySettingsForLog(proxySettings) });
  agent = _createProxyHttpsAgent(proxySettings);
};

const _createProxyHttpsAgent = (proxySettings: ProxySettings): HttpsProxyAgent => {
  // For hpagent (main process), we use proxy URL WITH credentials
  // hpagent has native support for Basic authentication when credentials are in the URL
  const proxyUrl = _buildProxyUrlWithCredentials(proxySettings);
  const cleanUrl = _buildCleanProxyUrl(proxySettings);

  // Verify credentials are embedded by checking if URL contains '@'
  const hasEmbeddedCredentials = proxyUrl.includes('@');

  log.info('Proxy agent configured', {
    cleanProxyUrl: cleanUrl,
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    hasEmbeddedCredentials,
    username: proxySettings.username,
  });

  return new HttpsProxyAgent({
    ...httpsAgentOptions,
    proxy: proxyUrl, // URL with embedded credentials for hpagent
    scheduling: 'lifo',
  });
};

/**
 * Builds a proxy URL WITH embedded credentials for hpagent (main process)
 * Format: protocol://username:password@host:port
 * hpagent natively handles Basic authentication when credentials are in the URL
 */
const _buildProxyUrlWithCredentials = (proxySettings: ProxySettings): string => {
  // If structured fields are provided, use them (preferred)
  if (proxySettings.host && proxySettings.port) {
    const protocol = proxySettings.protocol || 'http';
    const { username, password } = proxySettings;

    if (username && password) {
      // Encode credentials for URL
      const encodedUser = encodeURIComponent(username);
      const encodedPass = encodeURIComponent(password);
      return `${protocol}://${encodedUser}:${encodedPass}@${proxySettings.host}:${proxySettings.port}`;
    }

    return `${protocol}://${proxySettings.host}:${proxySettings.port}`;
  }

  // Fall back to using the URL field as-is (may already contain credentials)
  if (proxySettings.url) {
    return proxySettings.url;
  }

  throw new Error('Proxy settings must include either (host + port) or url');
};

/**
 * Builds a clean proxy URL without embedded credentials (for Chromium/renderer)
 * Format: protocol://host:port
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
      // Remove username/password from URL if present
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      log.error('Failed to parse proxy URL', { error, url: proxySettings.url });
      throw new Error(`Invalid proxy URL: ${proxySettings.url}`);
    }
  }

  throw new Error('Proxy settings must include either (host + port) or url');
};

/**
 * Sanitizes proxy settings for logging (removes password)
 */
const _sanitizeProxySettingsForLog = (proxySettings: ProxySettings): Record<string, unknown> => {
  const { password, ...sanitized } = proxySettings;
  return {
    ...sanitized,
    password: password ? '***' : undefined,
  };
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
  }
};

const _isLocalHttpOrigin = () => LOADMILL_WEB_APP_ORIGIN.startsWith('http://');
