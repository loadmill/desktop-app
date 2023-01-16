import log from '../../log';
import {
  AppendFileFunction,
  appendToFile,
  toFullPath,
} from '../files';

const PROXY_ERRORS_FILENAME = 'proxy-errors.log';
log.info('FULL_PROXY_ERRORS_PATH', toFullPath(PROXY_ERRORS_FILENAME));

export const getProxyErrorsLogPath = (): string => {
  return toFullPath(PROXY_ERRORS_FILENAME);
};

export const appendToProxyErrorsLog: AppendFileFunction = (text: string): void => {
  appendToFile(text, PROXY_ERRORS_FILENAME);
};
