import path from 'path';

import { app } from 'electron';

export const MAIN_LOG_FILENAME = 'main.log';

let LOGS_PATH: string;
let MAIN_LOG_FILE_PATH: string;

if (app && app.getPath) {
  LOGS_PATH = app.getPath('logs');
  MAIN_LOG_FILE_PATH = path.join(LOGS_PATH, MAIN_LOG_FILENAME);
} else {
  // app is undefined in renderer process
  LOGS_PATH = '';
  MAIN_LOG_FILE_PATH = MAIN_LOG_FILENAME;
}

export { LOGS_PATH, MAIN_LOG_FILE_PATH };
