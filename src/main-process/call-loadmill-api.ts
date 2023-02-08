import fetch, { RequestInit, Response } from 'node-fetch';

import { LOADMILL_WEB_APP_ORIGIN } from './constants';
import { getCookie } from './cookies';

export const callLoadmillApi = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const cookie = await getCookie();
  const { headers = {}, ...rest } = init;
  const response = await fetch(LOADMILL_WEB_APP_ORIGIN + '/' + path, {
    headers: { ...headers, 'cookie': cookie },
    ...rest,
  });
  return response;
};
