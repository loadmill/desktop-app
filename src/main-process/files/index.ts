import { appendFile, readFileSync } from 'fs';

import log from '../../log';
import { textToNonEmptyLines } from '../../universal/utils';
import { USER_DATA_PATH } from '../constants';

export const toFullPath = (fileName: string): string => {
  return `${USER_DATA_PATH}/${fileName}`;
};

export const readFile = (fileName: string): string[] => {
  const filePath = `${USER_DATA_PATH}/${fileName}`;
  const result = [];
  try {
    const buffer = readFileSync(filePath);
    result.push(...textToNonEmptyLines(buffer.toString()));
  } catch (e) {
    log.info(`Not created ${fileName} file yet.`);
  }
  return result;
};

export type ReadFileFunction = typeof readFile;

export const appendToFile = (text: string, fileName: string): void => {
  const filePath = `${USER_DATA_PATH}/${fileName}`;
  appendFile(filePath, text, (err) => {
    if (err) {
      throw err;
    }
  });
};

export type AppendFileFunction = typeof appendToFile;
