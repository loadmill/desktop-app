import fs from 'fs';
import path from 'path';

import { dialog } from 'electron';

import log from '../../log';
import {
  STANDALONE_PLAYWRIGHT_DIR_PATH,
  USER_DATA_NODE_MODULES_PATH,
  USER_DATA_PATH,
} from '../constants';
import { getMainWindow } from '../main-window';

type PlaywrightSymlinkOptions = {
  triggeredByUser?: boolean;
};

/**
 * Ensures a clean environment by removing existing paths and recreating the Playwright symlink.
 * Creates a link in user data path pointing to @playwright package directory
 */
export const symlinkPlaywright = ({ triggeredByUser = false }: PlaywrightSymlinkOptions = {}): void => {
  log.info('Starting Playwright symlink setup...', { triggeredByUser });
  try {
    if (!triggeredByUser) {
      _removeOldPlaywrightPackage();
    }
    _removeSymlinkDestination();
    _createSymlink();
    log.info('Finished setting up Playwright package symlink.');
    triggeredByUser && showSetupSuccessMessage();
  } catch (error) {
    log.error('Failed to set up Playwright package in user data path:', error);
    triggeredByUser && showSetupErrorMessage(error);
  }
};

/**
 * Removes old manifest files if they exist.
 * Handles case of legacy app versions where the playwright bundle
 * was installed directly in user data path.
 */
const _removeOldPlaywrightPackage = (): void => {
  log.info('Removing existing Playwright package if exists...');

  const pathsToRemove = [
    (path.join(USER_DATA_PATH, 'package.json')),
    (path.join(USER_DATA_PATH, 'package-lock.json')),
  ];

  for (const p of pathsToRemove) {
    if (fs.existsSync(p)) {
      log.info(`Removing old file: ${p}`);
      try {
        fs.rmSync(p);
        log.info(`Removed old Playwright package file: ${p}`);
      } catch (error) {
        log.warn(`Failed to remove old Playwright package file: ${p}`, error);
      }
    }
  }
};

const _removeSymlinkDestination = (): void => {
  try {
    log.info('Removing Playwright symlink path...', { path: USER_DATA_NODE_MODULES_PATH });
    fs.rmSync(USER_DATA_NODE_MODULES_PATH, { recursive: true });
    log.info('Removed Playwright package symlink.');
  } catch (error) {
    log.warn('Playwright symlink path removal failed; symlink creation may fail.', error);
  }
};

const _createSymlink = (): void => {
  const dest = USER_DATA_NODE_MODULES_PATH;
  const src = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules');

  log.info('Creating symlink...', { dest, src });

  const type = process.platform === 'win32' ? 'junction' : 'dir';
  log.info({ os: process.platform, symlinkType: type });
  fs.symlinkSync(src, dest, type);

  log.info('Symlink created successfully.');
};

const showSetupSuccessMessage = () => {
  if (getMainWindow()) {
    dialog.showMessageBox(
      getMainWindow(),
      {
        message: '🎭✅\nPlaywright has been set up successfully',
        title: 'Setup Complete',
        type: 'info',
      },
    );
  }
};

const showSetupErrorMessage = (error: Error) => {
  if (getMainWindow()) {
    dialog.showMessageBox(
      getMainWindow(),
      {
        message: `Failed to set up Playwright on this app: ${error.message || error}`,
        title: 'Setup Error',
        type: 'error',
      },
    );
  }
};
