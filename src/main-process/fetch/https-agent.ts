import http from 'http';
import https from 'https';

import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import { shouldProxy } from '../settings/proxy-bypass';
import { sanitizeProxySettings } from '../settings/secret-sanitization';

export type HttpsAgent = https.Agent | HttpsProxyAgent | null;
export type HttpAgent = http.Agent | HttpProxyAgent | null;

type AgentType = 'http' | 'https';
type Agent = HttpAgent | HttpsAgent;

const proxyAgents: Record<AgentType, Agent> = {
  http: null,
  https: null,
};

const directAgents: Record<AgentType, Agent> = {
  http: null,
  https: null,
};

let currentProxySettings: ProxySettings | null = null;
let isProxyEnabled = false;

const agentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxFreeSockets: 256,
  maxSockets: 256,
  rejectUnauthorized: false,
};

export const getHttpsAgent = (url?: string): HttpsAgent => {
  return _getOrCreateAgent('https', url) as HttpsAgent;
};

export const getHttpAgent = (url?: string): HttpAgent => {
  return _getOrCreateAgent('http', url) as HttpAgent;
};

const _getOrCreateAgent = (type: AgentType, url?: string): Agent => {
  if (isProxyEnabled && url) {
    if (shouldProxy(url, currentProxySettings)) {
      log.info('PROXYING request', { url });
      return _getOrCreateProxyAgent(type) as HttpProxyAgent;
    } else {
      log.warn('BYPASSING proxy for request', { url });
    }
  }

  return _getOrCreateDirectAgent(type);
};

const _getOrCreateDirectAgent = (type: AgentType): Agent => {
  if (!directAgents[type]) {
    _createDirectAgent(type);
  }
  return directAgents[type];
};

const _getOrCreateProxyAgent = (type: AgentType): Agent => {
  if (!proxyAgents[type]) {
    _createProxyAgent(type, currentProxySettings);
  }
  return proxyAgents[type];
};

export const useProxyAgent = (proxySettings: ProxySettings): void => {
  log.info('Enabling proxy agents', {
    proxySettings: sanitizeProxySettings(proxySettings),
  });

  currentProxySettings = proxySettings;
  isProxyEnabled = true;

  _initializeProxyAgents(proxySettings);
  _initializeDirectAgents();
};

const _initializeProxyAgents = (proxySettings: ProxySettings): void => {
  _createProxyAgent('https', proxySettings);
  _createProxyAgent('http', proxySettings);
};

const _initializeDirectAgents = (): void => {
  _createDirectAgent('https');
  _createDirectAgent('http');
};

const _createProxyAgent = (
  type: AgentType,
  proxySettings: ProxySettings,
): void => {
  const proxyUrl = buildProxyUrlWithCredentials(proxySettings);
  const cleanUrl = _buildCleanProxyUrl(proxySettings);
  const hasEmbeddedCredentials = proxyUrl.includes('@');

  log.info(`Proxy ${type} agent configured`, {
    cleanProxyUrl: cleanUrl,
    hasCredentials: !!(proxySettings.username && proxySettings.password),
    hasEmbeddedCredentials,
    username: proxySettings.username,
  });

  const AgentClass = type === 'https' ? HttpsProxyAgent : HttpProxyAgent;
  proxyAgents[type] = new AgentClass({
    ...agentOptions,
    proxy: proxyUrl,
    scheduling: 'lifo',
  });
};

const _createDirectAgent = (type: AgentType): void => {
  if (directAgents[type]) {
    log.debug(`${type.toUpperCase()} direct agent already exists`);
    return;
  }

  log.info(`Creating direct ${type.toUpperCase()} agent`);
  const AgentClass = type === 'https' ? https.Agent : http.Agent;
  directAgents[type] = new AgentClass(agentOptions);
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
