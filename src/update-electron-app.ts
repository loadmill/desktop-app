import updater from 'update-electron-app';

import {
  overrideOnUpdateDownloadedListener,
  overrideOnUpdateNotAvailableListener
} from './updates';

updater({
  logger: require('electron-log'),
  notifyUser: false,
  repo: 'loadmill/desktop-app',
  updateInterval: '5 minutes',
});

overrideOnUpdateDownloadedListener();
overrideOnUpdateNotAvailableListener();
