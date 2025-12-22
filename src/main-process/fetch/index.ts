import fetch, { RequestInit, Response } from 'node-fetch';

import { getHttpAgent, getHttpsAgent } from './https-agent';

const _fetch = async (path: string, reqInit: RequestInit = {}): Promise<Response> => {
  const response = await fetch(path, {
    agent: getAgentByProtocol(path),
    ...reqInit,
  });
  return response;
};

export {
  _fetch as fetch,
  RequestInit,
  Response,
};

const getAgentByProtocol = (url: string) => {
  const urlObj = new URL(url);
  if (urlObj.protocol === 'http:') {
    return getHttpAgent(url);
  }
  return getHttpsAgent(url);
};
