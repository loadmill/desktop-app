import log from '../../log';
import { Token } from '../../types/token';
import { get } from '../persistence-store';
import { TOKEN } from '../persistence-store/constants';
import { createAndSaveToken, isCorrectUser, isValidToken } from '../token';

/**
 * Shared token retrieval/creation logic used by multiple agent modules.
 *
 * Extracted from agent-ipc-handlers to avoid circular dependencies between
 * IPC handlers and the process manager.
 */
export const getOrCreateToken = async (): Promise<Token | undefined> => {
  const token = get<Token>(TOKEN);
  if (isValidToken(token) && await isCorrectUser(token.owner)) {
    return token;
  }

  log.info('Token does not exists / old format / of a different user');
  log.info('Fetching new token from loadmill server');
  return await createAndSaveToken();
};
