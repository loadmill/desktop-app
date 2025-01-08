import path from 'path';

import log, { LevelOption, MainLogger } from 'electron-log';

import {
  LOGS_PATH,
} from './constants';

const setMainLogLevels = () => {
  log.transports.console.level = 'silly';
  // Now log.debug Will show in console mode (dev) but not in file mode (prod)
  if (log.transports.file) {
    log.transports.file.level = 'info';
    log.info('Main logger created. Writing to file: ', log.transports.file?.getFile().path);
  }
};

setMainLogLevels();

export const createLogger = (
  logId: string,
  filePath: string,
  fileLevel: LevelOption = 'info',
  consoleLevel: LevelOption = 'silly',
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
