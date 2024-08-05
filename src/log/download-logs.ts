import path from 'path';

import { shell } from 'electron';

import { DOWNLOADS_PATH } from '../downloads/constants';
import { copyFile } from '../main-process/copy-file';

import {
  MAIN_LOG_FILE_PATH,
} from './constants';

const DESKTOP_APP_MAIN_LOG_FILENAME = 'loadmill-desktop-app.log';
export const APP_LOG_SAVE_PATH = path.join(DOWNLOADS_PATH, DESKTOP_APP_MAIN_LOG_FILENAME);

export const downloadMainLog = (): void => {
  copyFile(MAIN_LOG_FILE_PATH, APP_LOG_SAVE_PATH, () => {
    shell.showItemInFolder(APP_LOG_SAVE_PATH);
  });
};
