import https from 'https';

import { HttpsProxyAgent } from 'hpagent';

import log from '../../log';

export enum HttpsProxyAgentType {
  DEFAULT = 'default',
  PROXY = 'proxy',
}

let agent: https.Agent | HttpsProxyAgent | null | undefined;

export const getHttpsAgent = (): https.Agent | HttpsProxyAgent | undefined => {
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

const _createDefaultHttpsAgent = (): https.Agent => {
  return new https.Agent(httpsAgentOptions);
};

const _destroyAgent = (): void => {
  if (agent) {
    log.info('Destroying HTTPS agent');
    agent.destroy();
    agent = null;
  }
};
