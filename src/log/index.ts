import path from 'path';

import log from 'electron-log';

import {
  LOGS_PATH,
} from './constants';

const setMainLogLevels = () => {
  log.transports.file.level = 'info';
  log.transports.console.level = 'silly';
  // Now log.debug Will show in console mode (dev) but not in file mode (prod)
  log.info('Main logger created. Writing to file: ', log.transports.file.getFile().path);
};

setMainLogLevels();

export const createLogger = (
  logId: string,
  filePath: string,
  fileLevel: log.LevelOption = 'info',
  consoleLevel: log.LevelOption = 'silly',
): Logger => {
  const logger = log.create(logId) as Logger;
  logger.transports.file.resolvePath = () => path.join(LOGS_PATH, filePath);
  logger.transports.file.level = fileLevel;
  logger.transports.console.level = consoleLevel;
  logger.filePath = logger.transports.file.getFile().path;
  return logger;
};

export type Logger = log.ElectronLog & {
  filePath: string;
};

export default log;
