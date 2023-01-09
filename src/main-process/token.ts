import fetch from 'node-fetch';

import log from '../log';
import { TOKEN } from '../universal/constants';

import { LOADMILL_WEB_APP_ORIGIN } from './constants';
import { getCookie } from './cookies';
import { set } from './store';

export const createAndSaveToken = async (): Promise<void> => {
  try {
    await _createAndSaveToken();
  } catch (e) {
    log.error('Failed to create and save token', e);
  }
};

export const _createAndSaveToken = async (): Promise<void> => {
  const cookie = await getCookie();
  const response = await fetch(LOADMILL_WEB_APP_ORIGIN + '/settings/tokens', {
    headers: { 'cookie': cookie },
    method: 'POST',
  });

  const { token } = await response.json() as { id: string; token: string; };
  log.info('Setting new token', hideToken(token));
  set(TOKEN, token);
};

const hideToken = (token: string) => '*'.repeat(token.length - 4) + token.substring(token.length - 4);
