import path from 'path';

import {
  app,
  BrowserWindow,
} from 'electron';

import log from '../log';

import { handleAuthEvent } from './authentication';
import { LOADMILL_DESKTOP_APP_PROTOCOL } from './constants';

enum HOST {
  AUTH = 'auth',
}

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
    const host = extractHost(url);
    switch (host) {
      case HOST.AUTH:
        handleAuthEvent(url);
        break;
      default:
        log.error('Unknown host', { host });
        break;
    }
  });
}

const extractHost = (url: string): HOST | undefined => {
  const urlObj = new URL(url);
  switch (urlObj.host) {
    case 'auth':
      return HOST.AUTH;
    default:
      return;
  }
};
