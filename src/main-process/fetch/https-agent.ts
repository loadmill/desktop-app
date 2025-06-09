import http from 'http';
import https from 'https';

import { HttpsProxyAgent } from 'hpagent';

import log from '../../log';
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

export const useProxyHttpsAgent = (proxyUrl: string): void => {
  _destroyAgent();
  log.info('Using proxy HTTPS agent', { proxyUrl });
  agent = _createProxyHttpsAgent(proxyUrl);
};

const _createProxyHttpsAgent = (proxyUrl: string): HttpsProxyAgent => {
  return new HttpsProxyAgent({
    ...httpsAgentOptions,
    proxy: proxyUrl,
    scheduling: 'lifo',
  });
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
