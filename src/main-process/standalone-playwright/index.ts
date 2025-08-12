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
    const targetPath = path.join(userDataPath, 'node_modules');
    const packageJsonPath = path.join(userDataPath, 'package.json');
    const packageLockPath = path.join(userDataPath, 'package-lock.json');
    let shouldCopy = true;
    if (fs.existsSync(targetPath)) {
      log.info('User data node_modules path already exists:', targetPath);
      const localBrowsersPath = path.join(targetPath, 'playwright-core', '.local-browsers');
      if (fs.existsSync(localBrowsersPath)) {
        log.info('.local-browsers directory exists:', localBrowsersPath);
        const browserDirs = fs.readdirSync(localBrowsersPath);
        log.info('Browsers in .local-browsers:', browserDirs);
        const hasChromiumHeadlessShell = browserDirs.some(dir => dir.startsWith('chromium_headless_shell'));
        if (hasChromiumHeadlessShell) {
          log.info('chromium_headless_shell found in .local-browsers, removing old Playwright install...');
          if (!_removeOldPlaywright(targetPath, packageJsonPath, packageLockPath, 'user data path')) {
            shouldCopy = false;
          }
        } else {
          log.info('chromium_headless_shell not found, skipping copy.');
          shouldCopy = false;
        }
      } else {
        log.error('.local-browsers directory not found inside node_modules. Removing old Playwright install and will proceed to copy Playwright files.');
        if (!_removeOldPlaywright(targetPath, packageJsonPath, packageLockPath, 'user data path (no .local-browsers)')) {
          shouldCopy = false;
        }
      }
    }

    if (shouldCopy) {
      log.info('Copying standalone Playwright node_modules to user data path:', userDataPath);
      await _copyDirectory(STANDALONE_PLAYWRIGHT_DIR_PATH, userDataPath);
      log.info('Successfully copied standalone Playwright to user data path:', userDataPath);
      _replaceSymlinks();
      log.info('Updated symlinks for Playwright in user data path:', userDataPath);
    }
  } catch (err) {
    log.error('Error copying standalone Playwright node_modules to user data path');
    log.error(err);
  }
};

const _removeOldPlaywright = (
  targetPath: string,
  packageJsonPath: string,
  packageLockPath: string,
  context: string,
): boolean => {
  try {
    fs.rmSync(targetPath, { force: true, recursive: true });
    if (fs.existsSync(packageJsonPath)) {
      fs.rmSync(packageJsonPath, { force: true });
    }
    if (fs.existsSync(packageLockPath)) {
      fs.rmSync(packageLockPath, { force: true });
    }
    log.info(`Removed old Playwright install from ${context}.`);
    return true;
  } catch (err) {
    log.error(`Failed to remove old Playwright install from ${context}:`, err);
    return false;
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
