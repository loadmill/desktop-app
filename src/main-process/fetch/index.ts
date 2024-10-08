import fetch, { RequestInit, Response } from 'node-fetch';

import { getHttpsAgent } from './https-agent';

const _fetch = async (path: string, reqInit: RequestInit = {}): Promise<Response> => {
  const response = await fetch(path, {
    agent: getHttpsAgent(),
    ...reqInit,
  });
  return response;
};

export {
  _fetch as fetch,
  RequestInit,
  Response,
};
