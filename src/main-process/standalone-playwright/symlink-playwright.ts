
import fs from 'fs';
import path from 'path';

import {
  STANDALONE_PLAYWRIGHT_DIR_PATH,
  USER_DATA_PATH,
} from '../constants';

/**
 * Creates a link in user data path pointing to @playwright package directory
 */
export const symlinkPlaywright = (): void => {
  _removePlaywrightPackageIfExists();
  _createSymlink();
};

const _removePlaywrightPackageIfExists = (): void => {
  const userDataPath = USER_DATA_PATH;
  const nodeModulesPath = path.join(userDataPath, 'node_modules');
  const packageJsonPath = path.join(userDataPath, 'package.json');
  const packageLockPath = path.join(userDataPath, 'package-lock.json');

  const pathsToRemove = [nodeModulesPath, packageJsonPath, packageLockPath];

  for (const p of pathsToRemove) {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { force: true, recursive: true });
    }
  }
};

const _createSymlink = (): void => {
  const userDataPath = USER_DATA_PATH;
  const src = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules');
  const dest = path.join(userDataPath, 'node_modules');
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { force: true, recursive: true });
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  fs.symlinkSync(src, dest, 'dir');
};
