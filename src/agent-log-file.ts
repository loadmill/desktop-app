import { appendFile, readFileSync } from 'fs';

import { app } from 'electron';

import log from './log';
import { textToNonEmptyLines } from './utils';

const AGENT_LOG_FILENAME = 'agent.log';
const FULL_AGENT_LOG_PATH = `${app.getPath('userData') }/${AGENT_LOG_FILENAME}`;
log.info('FULL_AGENT_LOG_PATH', FULL_AGENT_LOG_PATH);

export const readAgentLog = (): string[] => {
  const result = [];
  try {
    const buffer = readFileSync(FULL_AGENT_LOG_PATH);
    result.push(...textToNonEmptyLines(buffer.toString()));
  } catch (e) {
    log.info('Not created agent.log file yet.');
  }
  return result;
};

export const appendToAgentLog = (text: string): void => {
  appendFile(FULL_AGENT_LOG_PATH, text, (err) => {
    if (err) {
      throw err;
    }
  });
};
