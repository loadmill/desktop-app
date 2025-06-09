import log from '../log';

import { getCookie } from './cookies';
import { fetch, RequestInit, Response } from './fetch';
import { LOADMILL_WEB_APP_ORIGIN } from './settings/web-app-settings';

export const callLoadmillApi = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const cookie = await getCookie();
  if (!cookie) {
    throw new Error('No cookie');
  }
  const { headers = {}, ...rest } = init;
  const response = await fetch(LOADMILL_WEB_APP_ORIGIN + '/' + path, {
    headers: { ...headers, 'cookie': cookie },
    ...rest,
  });
  log.info('Called Loadmill API', { path });
  return response;
};
