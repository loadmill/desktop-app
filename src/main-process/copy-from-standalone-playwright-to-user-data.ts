import fs from 'fs';
import path from 'path';

import { app } from 'electron';

import log from '../log';

import { STANDALONE_PLAYWRIGHT_FOLDER_PATH } from './constants';
/**
 * This module is used to copy the standalone Playwright packages and browser
 * binaries from the standalone Playwright directory to the user data directory.
 * It also updates the symlinks for playwright and playwright-core to point to userData/node_modules/playwright*
 * It also creates symlinks for the Node.js, npm, and npx binaries in the bin
 * directory of the standalone Playwright package.
 */
const userDataPath = app.getPath('userData');

export const copyStandalonePlaywrightToUserData = async (): Promise<void> => {
  _logInfo('Copying standalone Playwright to user data path', {
    STANDALONE_PLAYWRIGHT_FOLDER_PATH,
    userDataPath,
  });
  if (!fs.existsSync(STANDALONE_PLAYWRIGHT_FOLDER_PATH)) {
    _logError('Standalone Playwright folder path does not exist:', STANDALONE_PLAYWRIGHT_FOLDER_PATH);
    return;
  }
  if (!fs.existsSync(userDataPath)) {
    _logError('User data path does not exist:', userDataPath);
    return;
  }
  const targetPath = path.join(userDataPath, 'node_modules');
  if (fs.existsSync(targetPath)) {
    _logInfo('User data node_modules path already exists:', targetPath);
    return;
  }
  _logInfo('Copying standalone Playwright node_modules to user data path:', userDataPath);
  try {
    await _copyDirectory(STANDALONE_PLAYWRIGHT_FOLDER_PATH, userDataPath);
    _logInfo('Successfully copied standalone Playwright to user data path:', userDataPath);
    _replaceSymlinks();
    _logInfo('Updated symlinks for Playwright in user data path:', userDataPath);
  } catch (err) {
    _logError('Error copying standalone Playwright node_modules to user data path:', err);
    return;
  }
};

const _copyDirectory = (src: string, dest: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.cp(src, dest, { recursive: true }, (err) => {
      if (err) {
        _logError('Error copying directory:', err);
        reject(err);
      } else {
        _logInfo('Successfully copied directory:', src, 'to', dest);
        resolve();
      }
    });
  });
};

const _replaceSymlinks = () => {
  const linksFolderPath = path.join(app.getPath('userData'), 'node_modules', '.bin');
  const symlinks = [
    {
      link: path.join(linksFolderPath, 'playwright'),
      target: path.join('../', 'playwright', 'cli.js'),
    },
    {
      link: path.join(linksFolderPath, 'playwright-core'),
      target: path.join('../', 'playwright-core', 'cli.js'),
    },
  ];

  // delete .bin folder if it exists
  if (fs.existsSync(linksFolderPath)) {
    _logInfo('Deleting existing .bin folder:', linksFolderPath);
    fs.rmSync(linksFolderPath, { force: true, recursive: true });
    _logInfo('Deleted existing .bin folder:', linksFolderPath);
  } else {
    _logInfo('No existing .bin folder to delete:', linksFolderPath);
  }
  // create .bin folder
  _logInfo('Creating .bin folder:', linksFolderPath);
  fs.mkdirSync(linksFolderPath, { recursive: true });
  _logInfo('Created .bin folder:', linksFolderPath);

  symlinks.forEach(({ link, target }) => {
    _logInfo('Creating symlink', { link, target });
    fs.symlinkSync(target, link);
    _logInfo('Created symlink ', { link, target });
  });
};

const _logPrefix = '[Copy standalone Playwright to user data]';

const _logInfo = (...args: (string | object)[]) => {
  log.info(_logPrefix, ...args);
};
const _logError = (...args: (string | Error)[]) => {
  log.error(_logPrefix, ...args);
};
