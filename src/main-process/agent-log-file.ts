import { appendFile } from 'fs';

import log from '../log';

import { FULL_AGENT_LOG_PATH } from './constants';

log.info('FULL_AGENT_LOG_PATH', FULL_AGENT_LOG_PATH);

export const appendToAgentLog = (text: string): void => {
  appendFile(FULL_AGENT_LOG_PATH, text, (err) => {
    if (err) {
      throw err;
    }
  });
};
