import log from '../log';
import { Token } from '../types/token';

import { callLoadmillApi } from './call-loadmill-api';
import { TOKEN } from './electron-store/constants';
import { set } from './electron-store/store';
import { getUser } from './user';

export const isValidToken = (token: unknown): token is Token => (
  typeof token === 'object' &&
  token !== null &&
  'id' in token &&
  'owner' in token &&
  'token' in token
);

export const isCorrectUser = async (userId: string): Promise<boolean> => {
  const { id } = await getUser();
  return id === userId;
};

export const createAndSaveToken = async (): Promise<Token | undefined> => {
  try {
    return await _createAndSaveToken();
  } catch (e) {
    log.error('Failed to create and save token', e);
  }
};

const _createAndSaveToken = async (): Promise<Token> => {
  const response = await callLoadmillApi('settings/tokens', {
    method: 'POST',
  });

  const token = await response.json() as Token;
  log.info('Setting new token', {
    id: token.id,
    owner: token.owner,
    token: hideToken(token.token),
  });
  set(TOKEN, token);
  return token;
};

const hideToken = (token: string) => '*'.repeat(token.length - 4) + token.substring(token.length - 4);
