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
  try {
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
    log.info('Copying standalone Playwright node_modules to user data path:', userDataPath);
    await _copyDirectory(STANDALONE_PLAYWRIGHT_DIR_PATH, userDataPath);
    log.info('Successfully copied standalone Playwright to user data path:', userDataPath);
    _replaceSymlinks();
    log.info('Updated symlinks for Playwright in user data path:', userDataPath);
  } catch (err) {
    log.error('Error copying standalone Playwright node_modules to user data path');
    log.error(err);
  }
};

const _copyDirectory = (src: string, dest: string) => {
  return new Promise<void>((resolve, reject) => {
    // Custom recursive copy to skip chromium-1155
    const copyRecursive = (currentSrc: string, currentDest: string) => {
      fs.readdir(currentSrc, { withFileTypes: true }, (err, entries) => {
        if (err) {
          log.error('Error reading directory:', err);
          return reject(err);
        }
        fs.mkdirSync(currentDest, { recursive: true });
        for (const entry of entries) {
          const srcPath = path.join(currentSrc, entry.name);
          const destPath = path.join(currentDest, entry.name);
          // Skip chromium-1155 in .local-browsers
          if (
            entry.isDirectory() &&
            entry.name === 'chromium-1155' &&
            currentSrc.endsWith(path.join('playwright-core', '.local-browsers'))
          ) {
            log.info('Skipping chromium-1155 directory:', srcPath);
            continue;
          }
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      });
    };
    try {
      copyRecursive(src, dest);
      log.info('Successfully copied directory (skipping chromium-1155 if present):', src, 'to', dest);
      resolve();
    } catch (err) {
      log.error('Error copying directory:', err);
      reject(err);
    }
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
