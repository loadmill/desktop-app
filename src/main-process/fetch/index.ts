import https from 'https';

import fetch, { RequestInit, Response } from 'node-fetch';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const _fetch = async (path: string, reqInit: RequestInit = {}): Promise<Response> => {
  const response = await fetch(path, {
    agent: httpsAgent,
    ...reqInit,
  });
  return response;
};

export {
  _fetch as fetch,
  RequestInit,
  Response,
};
