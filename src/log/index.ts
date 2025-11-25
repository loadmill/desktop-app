import path from 'path';

import log, { LevelOption, MainLogger } from 'electron-log';

import {
  LOGS_PATH,
} from './constants';

log.info('Main logger created.');

const setMainLogLevels = () => {
  log.transports.console.level = 'debug';
  // Now log.debug will show in both console and file modes
  if (log.transports.file) {
    log.transports.file.level = 'debug';
    log.info('Writing to file: ', log.transports.file?.getFile().path);
  }
};

setMainLogLevels();

export const createLogger = (
  logId: string,
  filePath: string,
  fileLevel: LevelOption = 'debug',
  consoleLevel: LevelOption = 'debug',
): Logger => {
  const logger = log.create({ logId }) as Logger;
  logger.initialize();
  if (logger.transports.file) {
    logger.transports.file.resolvePathFn = () => path.join(LOGS_PATH, filePath);
    logger.transports.file.level = fileLevel;
    logger.filePath = logger.transports.file.getFile().path;
  }
  logger.transports.console.level = consoleLevel;
  return logger;
};

export type Logger = MainLogger & {
  default: MainLogger;
} & {
  filePath: string;
};

export default log;
