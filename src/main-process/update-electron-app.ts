import { app, autoUpdater } from 'electron';

import log from '../log';

import { getSettings } from './settings/settings-store';
import { getFeedURL } from './update-feed-url';
import {
  overrideOnUpdateDownloadedListener,
  overrideOnUpdateNotAvailableListener,
} from './updates';

const UPDATE_HOST = 'https://update.electronjs.org';
const UPDATE_REPO = 'loadmill/desktop-app';
const UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const SUPPORTED_PLATFORMS: NodeJS.Platform[] = ['darwin', 'win32'];

export const initUpdater = (onUpdateDownloaded: () => void): void => {
  const settings = getSettings();
  if (settings?.autoUpdate === false) {
    log.info('Auto update is disabled');
    return;
  }

  if (!app.isPackaged) {
    log.info('Auto update skipped, app is not packaged');
    return;
  }

  if (!SUPPORTED_PLATFORMS.includes(process.platform)) {
    log.info(`Auto update is not supported on platform '${process.platform}'`);
    return;
  }

  log.info('Auto update is enabled');
  log.info('Initializing auto updater');

  const feedURL = getFeedURL({
    arch: process.arch,
    host: UPDATE_HOST,
    platform: process.platform,
    repo: UPDATE_REPO,
    runningUnderARM64Translation: app.runningUnderARM64Translation,
    version: app.getVersion(),
  });
  const headers = { 'User-Agent': `${app.getName()}/${app.getVersion()} (${process.platform}: ${process.arch})` };
  log.info('Auto updater feed URL', { feedURL, headers, runningUnderARM64Translation: app.runningUnderARM64Translation });
  autoUpdater.setFeedURL({ headers, url: feedURL });

  autoUpdater.on('error', (err) => log.error('Auto updater error', err));
  autoUpdater.on('checking-for-update', () => log.info('checking-for-update'));
  autoUpdater.on('update-available', () => log.info('update-available; downloading...'));
  autoUpdater.on('update-not-available', () => log.info('update-not-available'));

  overrideOnUpdateDownloadedListener(onUpdateDownloaded);
  overrideOnUpdateNotAvailableListener();

  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), UPDATE_INTERVAL_MS);
  log.info('Auto updater will check for updates every 5 minutes');
};
