import https from 'https';

import { app } from 'electron';
import fetch, { RequestInit, Response } from 'node-fetch';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const _fetch = async (path: string, reqInit: RequestInit = {}): Promise<Response> => {
  const response = await fetch(path, {
    agent: app.isPackaged && httpsAgent,
    ...reqInit,
  });
  return response;
};

export {
  _fetch as fetch,
  RequestInit,
  Response,
};
