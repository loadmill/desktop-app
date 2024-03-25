import { shell } from 'electron';

import {
  APP_LOG_SAVE_PATH,
  FULL_APP_LOG_PATH,
} from './constants';
import { copyFile } from './copy-file';

export const downloadAppLog = (): void => {
  copyFile(FULL_APP_LOG_PATH, APP_LOG_SAVE_PATH, () => {
    shell.showItemInFolder(APP_LOG_SAVE_PATH);
  });
};
