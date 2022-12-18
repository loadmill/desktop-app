import { POTENTIAL_TOKEN, VALID_TOKEN } from './constants';
import log from './log';
import { get, set } from './store';

export const updateValidToken = (): void => {
  const potentialToken = get(POTENTIAL_TOKEN);
  if (potentialToken) {
    set(VALID_TOKEN, potentialToken);
    log.info('Saved valid token successfully');
  }
};

export const setPotentialToken = (potentialToken: string): void => {
  set(POTENTIAL_TOKEN, potentialToken);
};

export const getValidToken = (): string | undefined => {
  return get(VALID_TOKEN);
};
