import { appendFile, readFileSync } from 'fs';

import { app } from 'electron';

import log from '../../log';
import { textToNonEmptyLines } from '../../universal/utils';

export const toFullPath = (fileName: string): string => {
  return `${app.getPath('userData')}/${fileName}`;
};

export const readFile = (fileName: string): string[] => {
  const filePath = `${app.getPath('userData')}/${fileName}`;
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
  const filePath = `${app.getPath('userData')}/${fileName}`;
  appendFile(filePath, text, (err) => {
    if (err) {
      throw err;
    }
  });
};

export type AppendFileFunction = typeof appendToFile;
