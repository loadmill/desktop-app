import fs from 'fs';
import path from 'path';

import { app } from 'electron';

import log from '../../log';
import { STANDALONE_PLAYWRIGHT_DIR_PATH } from '../constants';

const userDataPath = app.getPath('userData');

/**
 * Copies the standalone Playwright directory to the user data path.
 * This is necessary to ensure that Playwright can be used in the Desktop app
 * without requiring a separate installation.
 * It also sets up the necessary symlinks for Playwright CLI commands.
 */
export const copyStandalonePlaywrightToUserData = async (): Promise<void> => {
  log.info('Copying standalone Playwright to user data path', {
    STANDALONE_PLAYWRIGHT_DIR_PATH,
    userDataPath,
  });
  if (!fs.existsSync(STANDALONE_PLAYWRIGHT_DIR_PATH)) {
    log.error('Standalone Playwright directory path does not exist', { STANDALONE_PLAYWRIGHT_DIR_PATH });
    return;
  }
  if (!fs.existsSync(userDataPath)) {
    log.error('User data path does not exist:', userDataPath);
    return;
  }
  const targetPath = path.join(userDataPath, 'node_modules');
  if (fs.existsSync(targetPath)) {
    log.info('User data node_modules path already exists:', targetPath);
    return;
  }
  log.info('Copying standalone Playwright node_modules to user data path:', userDataPath);
  try {
    await _copyDirectory(STANDALONE_PLAYWRIGHT_DIR_PATH, userDataPath);
    log.info('Successfully copied standalone Playwright to user data path:', userDataPath);
    _replaceSymlinks();
    log.info('Updated symlinks for Playwright in user data path:', userDataPath);
  } catch (err) {
    log.error('Error copying standalone Playwright node_modules to user data path:', err);
  }
};

const _copyDirectory = (src: string, dest: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.cp(src, dest, { recursive: true }, (err) => {
      if (err) {
        log.error('Error copying directory:', err);
        reject(err);
      } else {
        log.info('Successfully copied directory:', src, 'to', dest);
        resolve();
      }
    });
  });
};

const _replaceSymlinks = () => {
  const linksDirPath = path.join(app.getPath('userData'), 'node_modules', '.bin');
  const symlinks = [
    {
      link: path.join(linksDirPath, 'playwright'),
      target: path.join('../', 'playwright', 'cli.js'),
    },
    {
      link: path.join(linksDirPath, 'playwright-core'),
      target: path.join('../', 'playwright-core', 'cli.js'),
    },
  ];

  deleteBinDirIfExists(linksDirPath);
  createBinDir(linksDirPath);

  for (const { link, target } of symlinks) {
    log.info('Creating symlink', { link, target });
    fs.symlinkSync(target, link);
    log.info('Created symlink', { link, target });
  }
};

const deleteBinDirIfExists = (linksDirPath: string) => {
  if (fs.existsSync(linksDirPath)) {
    log.info('.bin directory exists', { linksDirPath });
    fs.rmSync(linksDirPath, { force: true, recursive: true });
    log.info('Deleted existing .bin directory', { linksDirPath });
    return;
  }
  log.info('No existing .bin directory to delete', { linksDirPath });
};

const createBinDir = (linksDirPath: string) => {
  log.info('Creating .bin directory:', linksDirPath);
  fs.mkdirSync(linksDirPath, { recursive: true });
  log.info('Created .bin directory:', linksDirPath);
};
