
import fs from 'fs';
import path from 'path';

import log from '../../log';
import {
  STANDALONE_PLAYWRIGHT_DIR_PATH,
  USER_DATA_PATH,
} from '../constants';

/**
 * Creates a link in user data path pointing to @playwright package directory
 */
export const symlinkPlaywright = (): void => {
  log.info('Starting to set up Playwright package in user data path...');
  _removePlaywrightPackageIfExists();
  _createSymlink();
  log.info('Finished setting up Playwright package in user data path.');
};

const _removePlaywrightPackageIfExists = (): void => {
  log.info('Removing existing Playwright package if exists...');
  const userDataPath = USER_DATA_PATH;
  const nodeModulesPath = path.join(userDataPath, 'node_modules');
  const packageJsonPath = path.join(userDataPath, 'package.json');
  const packageLockPath = path.join(userDataPath, 'package-lock.json');

  const pathsToRemove = [nodeModulesPath, packageJsonPath, packageLockPath];
  log.info('Paths to remove if they exist:', pathsToRemove);

  for (const p of pathsToRemove) {
    if (fs.existsSync(p)) {
      log.info(`Removing existing path: ${p}`);
      fs.rmSync(p, { force: true, recursive: true });
    }
  }
};

const _createSymlink = (): void => {
  log.info('Creating symlink for Playwright...');
  const userDataPath = USER_DATA_PATH;
  const src = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules');
  const dest = path.join(userDataPath, 'node_modules');

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  try {
    fs.symlinkSync(src, dest, symlinkType);
  } catch (err) {
    log.warn('Symlink failed, falling back to copy...', err);
    try {
      fs.cpSync(src, dest, { recursive: true });
    } catch (copyErr) {
      log.error('Copy also failed:', copyErr);
      throw copyErr;
    }
  }
};
