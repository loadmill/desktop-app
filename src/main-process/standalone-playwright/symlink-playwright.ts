import fs from 'fs';
import path from 'path';

import log from '../../log';
import {
  STANDALONE_PLAYWRIGHT_DIR_PATH,
  USER_DATA_NODE_MODULES_PATH,
  USER_DATA_PATH,
} from '../constants';

/**
 * Creates a link in user data path pointing to @playwright package directory
 */
export const symlinkPlaywright = (): void => {
  log.info('Starting to set up Playwright package in user data path...');
  try {
    if (_isSymlink(USER_DATA_NODE_MODULES_PATH)) {
      log.info('node_modules is already a symlink, nothing to do');
    } else {
      log.info('node_modules is not a symlink, proceeding to set up symlink...');
      _removePlaywrightPackageIfExists();
      _createSymlink();
    }
  } catch (error) {
    log.error('Failed to set up Playwright package in user data path:', error);
    return;
  }
  log.info('Finished setting up Playwright package in user data path.');
};

const _removePlaywrightPackageIfExists = (): void => {
  log.info('Removing existing Playwright package if exists...');
  const packageJsonPath = path.join(USER_DATA_PATH, 'package.json');
  const packageLockPath = path.join(USER_DATA_PATH, 'package-lock.json');

  const pathsToRemove = [USER_DATA_NODE_MODULES_PATH, packageJsonPath, packageLockPath];
  log.info('Paths to remove if they exist:', pathsToRemove);

  for (const p of pathsToRemove) {
    if (fs.existsSync(p)) {
      log.info(`Removing old file: ${p}`);
      fs.rmSync(p, { force: true, recursive: true });
    }
  }
  log.info('Old Playwright package removal process completed.');
};

const _createSymlink = (): void => {
  const dest = USER_DATA_NODE_MODULES_PATH;
  const src = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules');

  log.info('Creating symlink for Playwright package...', { dest, src });
  if (process.platform === 'win32') {
    log.info('Running on Windows, using junction for symlink...');
    fs.symlinkSync(src, dest, 'junction');
  } else {
    log.info('Running on non-Windows OS, using dir for symlink...');
    fs.symlinkSync(src, dest, 'dir');
  }
  log.info('Symlink created successfully', { dest, src });
};

const _isSymlink = (p: string): boolean => {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};
