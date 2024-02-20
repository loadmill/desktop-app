import path from 'path';

import {
  app,
  BrowserWindow,
} from 'electron';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
import log from '../log';
import { OAUTH_LOADMILL_LOGIN_TOKEN } from '../universal/constants';

import { LOADMILL_DESKTOP_APP_PROTOCOL } from './constants';
import { isUserSignedIn } from './user-signed-in-status';

log.info('Setting up deep link handling');

if (process.defaultApp) {
  log.info('Running in default app mode');
  if (process.argv.length >= 2) {
    log.info(`Setting as default protocol client: ${process.argv[1]}`);
    app.setAsDefaultProtocolClient(LOADMILL_DESKTOP_APP_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  log.info('Running in not default app mode');
  app.setAsDefaultProtocolClient(LOADMILL_DESKTOP_APP_PROTOCOL);
}

const gotTheLock = app.requestSingleInstanceLock();
log.info(`gotTheLock=${gotTheLock}`);
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const [mainWindow] = BrowserWindow.getAllWindows();
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
    log.info('Received second-instance event', { commandLine, event, workingDirectory });
  });

  app.on('open-url', (_event: Electron.Event, url: string) => {
    log.info('Received open-url event', { url });
    if (!isUserSignedIn()) {
      const token = getTokenFromUrl(url);
      sendToRenderer({
        data: { token },
        type: OAUTH_LOADMILL_LOGIN_TOKEN,
      });
    }
  });
}

const getTokenFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('token');
};
