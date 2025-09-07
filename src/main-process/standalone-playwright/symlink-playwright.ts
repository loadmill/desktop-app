
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
      try {
        // On Windows, check if it's a junction/symlink first
        if (process.platform === 'win32') {
          const stats = fs.lstatSync(p);
          if (stats.isSymbolicLink()) {
            // For junctions/symlinks, don't use recursive
            fs.rmSync(p, { force: true });
          } else {
            // For regular directories
            fs.rmSync(p, { force: true, recursive: true });
          }
        } else {
          fs.rmSync(p, { force: true, recursive: true });
        }
      } catch (err) {
        log.warn(`Failed to remove ${p} with rmSync, trying unlinkSync:`, err);
        try {
          // Fallback for stubborn junctions on Windows
          if (process.platform === 'win32') {
            fs.unlinkSync(p);
          }
        } catch (unlinkErr) {
          log.error(`Failed to remove ${p}:`, unlinkErr);
          // Don't throw here - let the symlink attempt happen anyway
        }
      }
    }
  }
};

const _createSymlink = (): void => {
  log.info('Creating symlink for Playwright...');
  const userDataPath = USER_DATA_PATH;
  const src = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules');
  const dest = path.join(userDataPath, 'node_modules');

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  log.info('Created directory for Playwright symlink:', path.dirname(dest));

  // Extra safety check - ensure dest doesn't exist
  if (fs.existsSync(dest)) {
    log.warn('Destination still exists after cleanup, forcing removal...');
    try {
      const stats = fs.lstatSync(dest);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(dest); // Use unlinkSync for symlinks/junctions
      } else {
        fs.rmSync(dest, { force: true, recursive: true });
      }
    } catch (err) {
      log.error('Failed to force remove destination:', err);
    }
  }

  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  try {
    fs.symlinkSync(src, dest, symlinkType);
    log.info('Symlink created successfully', { dest, src, symlinkType });
  } catch (err) {
    log.warn('Symlink failed, falling back to copy...', err);
    try {
      fs.cpSync(src, dest, { recursive: true });
      log.info('Copy fallback successful');
    } catch (copyErr) {
      log.error('Copy also failed:', copyErr);
      throw copyErr;
    }
  }
};
