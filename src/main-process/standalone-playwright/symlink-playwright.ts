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
    if (_isValidSymlink(USER_DATA_NODE_MODULES_PATH)) {
      log.info('Playwright package symlink already exists and is valid:', USER_DATA_NODE_MODULES_PATH);
    } else {
      _removePlaywrightPackageSymlinkIfExists();
      _removeOldPlaywrightPackageIfExists();
      _createSymlink();
    }
  } catch (error) {
    log.error('Failed to set up Playwright package in user data path:', error);
    return;
  }
  log.info('Finished setting up Playwright package in user data path.');
};

const _removePlaywrightPackageSymlinkIfExists = (): void => {
  log.info('Checking for existing Playwright package symlink...');

  if (_isDanglingSymlink(USER_DATA_NODE_MODULES_PATH)) {
    log.info('Found dangling symlink for Playwright package:', USER_DATA_NODE_MODULES_PATH);
    fs.rmSync(USER_DATA_NODE_MODULES_PATH);
    log.info('Removed dangling symlink for Playwright package:', USER_DATA_NODE_MODULES_PATH);
  } else {
    log.info('No dangling symlink found for Playwright package.');
  }
};

const _removeOldPlaywrightPackageIfExists = (): void => {
  log.info('Removing existing Playwright package if exists...');
  const packageJsonPath = path.join(USER_DATA_PATH, 'package.json');
  const packageLockPath = path.join(USER_DATA_PATH, 'package-lock.json');

  const pathsToRemove = [USER_DATA_NODE_MODULES_PATH, packageJsonPath, packageLockPath];

  const removedPaths: string[] = [];

  for (const p of pathsToRemove) {
    if (fs.existsSync(p)) {
      log.info(`Removing old file: ${p}`);
      fs.rmSync(p, { force: true, recursive: true });
      removedPaths.push(p);
    }
  }

  if (removedPaths.length === 0) {
    log.info('No old Playwright package files were found to remove.', pathsToRemove);
  } else {
    log.info('Old Playwright package removal process completed.', {
      removedCount: removedPaths.length,
      removedPaths,
    });
  }
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

const _isDanglingSymlink = (p: string): boolean => {
  return _isSymlink(p) && !fs.existsSync(p);
};

const _isValidSymlink = (p: string): boolean => {
  return _isSymlink(p) && fs.existsSync(p);
};
