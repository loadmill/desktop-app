import {
  sendFromLoadmillViewToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import {
  MAGIC_TOKEN,
  SHOW_AUTH_TOKEN_INPUT,
} from '../universal/constants';

import { isUserSignedIn } from './user-signed-in-status';

export const handleAuthEvent = (url: string): void => {
  if (!isUserSignedIn()) {
    const magicToken = getMagicTokenFromUrl(url);
    if (!magicToken) {
      log.error('No magic token found in URL', { url });
      return;
    }
    sendFromLoadmillViewToRenderer({
      data: { magicToken },
      type: MAGIC_TOKEN,
    });
  }
};

const getMagicTokenFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('magicToken');
};

export const showAuthTokenInput = (): void => {
  sendFromLoadmillViewToRenderer({ type: SHOW_AUTH_TOKEN_INPUT });
};
