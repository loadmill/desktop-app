import http from 'http';
import https from 'https';

import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import log from '../../log';
import { ProxySettings } from '../../types/settings';
import { sanitizeProxySettings } from '../settings/secret-sanitization';

export type HttpsAgent = https.Agent | HttpsProxyAgent | null;
export type HttpAgent = http.Agent | HttpProxyAgent | null;

type AgentType = 'http' | 'https';
type Agent = HttpAgent | HttpsAgent;

const agents: Record<AgentType, Agent> = {
  http: null,
  https: null,
};

const agentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxFreeSockets: 256,
  maxSockets: 256,
  rejectUnauthorized: false,
};

export const getHttpsAgent = (): HttpsAgent => {
  if (!agents.https) {
    _useDefaultAgent('https');
  }
  return agents.https as HttpsAgent;
};

export const getHttpAgent = (): HttpAgent => {
  if (!agents.http) {
    _useDefaultAgent('http');
  }
  return agents.http as HttpAgent;
};

export const useProxyAgent = (proxySettings: ProxySettings): void => {
  _useProxyAgent('https', proxySettings);
  _useProxyAgent('http', proxySettings);
};

const _useProxyAgent = (type: AgentType, proxySettings: ProxySettings): void => {
  _destroyAgent(type);
  log.info(`Using proxy ${type.toUpperCase()} agent`, {
    proxySettings: sanitizeProxySettings(proxySettings),
  });
  agents[type] = _createProxyAgent(type, proxySettings);
};

const _useDefaultAgent = (type: AgentType): void => {
  _destroyAgent(type);
  log.info(`Using default ${type.toUpperCase()} agent`);
  agents[type] = _createDefaultAgent(type);
};

const _createProxyAgent = (
  type: AgentType,
  proxySettings: ProxySettings,
): HttpProxyAgent | HttpsProxyAgent => {
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
  return new AgentClass({
    ...agentOptions,
    proxy: proxyUrl,
    scheduling: 'lifo',
  });
};

const _createDefaultAgent = (type: AgentType): http.Agent | https.Agent => {
  const AgentClass = type === 'https' ? https.Agent : http.Agent;
  return new AgentClass(agentOptions);
};

const _destroyAgent = (type: AgentType): void => {
  const agent = agents[type];
  if (agent) {
    log.info(`Destroying ${type.toUpperCase()} agent`);
    agent.destroy();
    agents[type] = null;
  } else {
    log.debug(`No ${type.toUpperCase()} agent to destroy`);
  }
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
