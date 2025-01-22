import updater from 'update-electron-app';

import log from '../log';

import { getSettings } from './settings/settings-store';
import {
  overrideOnUpdateDownloadedListener,
  overrideOnUpdateNotAvailableListener,
} from './updates';

export const initUpdater = (onUpdateDownloaded: () => void): void => {
  const settings = getSettings();
  if (settings?.autoUpdate === false) {
    log.info('Auto update is disabled');
    return;
  }

  log.info('Auto update is enabled');
  log.info('Initializing auto updater');

  updater({
    logger: log,
    notifyUser: false,
    repo: 'loadmill/desktop-app',
    updateInterval: '5 minutes',
  });

  log.info('Auto updater will check for updates every 5 minutes');

  overrideOnUpdateDownloadedListener(onUpdateDownloaded);
  overrideOnUpdateNotAvailableListener();
};
