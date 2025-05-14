import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';

import { app } from 'electron';
import { extract } from 'tar';

import log from '../log';
import { NodeBundleRunner } from '../node-bundle-runner';

import { fetch } from './fetch';

const PLAYWRIGHT_VERSION = process.env.PLAYWRIGHT_VERSION || '1.50.0';
const USER_DATA_PATH = process.env.USER_DATA_PATH || app.getPath('userData');
const packages = [
  `playwright@${PLAYWRIGHT_VERSION}`,
  `playwright-core@${PLAYWRIGHT_VERSION}`,
  `@playwright/test@${PLAYWRIGHT_VERSION}`,
];

/**
 * Downloads and installs Playwright and its dependencies to the user data directory
 * This function runs two commands:
 * 1. npm i @playwright/test@[version] - Install the Playwright test package
 * 2. npx playwright install --with-deps --only-shell - Install Playwright browser dependencies
 *
 * The Playwright version is determined by the PLAYWRIGHT_VERSION environment variable,
 * defaulting to '1.50.0' if not specified.
 *
 * @returns Promise that resolves when installation is complete
 */
export const downloadPlaywright2 = async (): Promise<void> => {
  try {
    // Initialize the NodeBundleRunner
    const nodeRunner = new NodeBundleRunner();

    log.info(`Using user data path: ${USER_DATA_PATH}`);
    log.info(`Using Playwright version: ${PLAYWRIGHT_VERSION}`);

    if (!fs.existsSync(USER_DATA_PATH)) {
      fs.mkdirSync(USER_DATA_PATH, { recursive: true });
    }

    const options = { cwd: USER_DATA_PATH };

    log.info('Starting Playwright installation...');

    // Step 1: Install Playwright test package with the specified version
    const fullPackageName = `@playwright/test@${PLAYWRIGHT_VERSION}`;
    log.info('Installing Playwright test package...', {
      fullPackageName,
      options,
    });
    await nodeRunner.runNpm(['i', fullPackageName], options);
    log.info('Successfully installed Playwright test package', {
      fullPackageName,
      options,
    });

    // Step 2: Install Playwright browser dependencies
    log.info('Installing Playwright browser dependencies...');
    await nodeRunner.runNpx(['playwright', 'install', '--with-deps', '--only-shell'], options);
    log.info('Successfully installed Playwright browser dependencies');

    log.info('Playwright installation completed successfully');
  } catch (error) {
    log.error('Failed to download Playwright:', error);
    throw error;
  }
};

export const downloadPlaywright = async (): Promise<void> => {
  log.info('Starting Playwright download process...');
  log.info('Arguments:', {
    PLAYWRIGHT_VERSION,
    USER_DATA_PATH,
  });

  const tempDir = path.join(USER_DATA_PATH, 'temp_playwright_download');
  const nodeModulesDir = path.join(USER_DATA_PATH, 'node_modules');

  try {
    log.info('Creating temporary directories...', {
      nodeModulesDir,
      tempDir,
    });
    await fs.promises.mkdir(tempDir, { recursive: true });
    await fs.promises.mkdir(nodeModulesDir, { recursive: true });
    log.info('Temporary directories created successfully.', {
      nodeModulesDir,
      tempDir,
    });

    log.info('Starting download of Playwright packages...');

    log.info('Downloading the following packages:', packages);

    for (const pkg of packages) {
      log.info('Started downloading', { pkg });
      const [scope, name] = pkg.includes('/') ? pkg.split('/') : [null, pkg];
      log.info('Details:', { name, scope });
      const pkgName = scope ? `${scope}/${name}` : name;
      log.info('Package name:', { pkgName });
      const tarballName = scope ?
        `${name.split('@')[0]}-${PLAYWRIGHT_VERSION}.tgz` :
        `${pkgName.split('@')[0]}-${PLAYWRIGHT_VERSION}.tgz`;
      log.info('Tarball name:', { tarballName });

      const registryUrl = scope ?
        `https://registry.npmjs.org/${scope}/${name.split('@')[0]}/-/${tarballName}` :
        `https://registry.npmjs.org/${pkgName.split('@')[0]}/-/${tarballName}`;
      log.info('Registry URL:', { registryUrl });

      const tarballPath = path.join(tempDir, tarballName);
      log.info('Tarball path:', { tarballPath });

      log.info('Starting downloading files...', { registryUrl, tarballPath });

      await _downloadFile(registryUrl, tarballPath);

      log.info('Finished downloading files.', { registryUrl, tarballPath });

      log.info('Creating directories for extraction...', { tarballPath });
      const extractDir = path.join(tempDir, 'extract', pkgName);
      await fs.promises.mkdir(extractDir, { recursive: true });
      log.info('Directories created successfully.', { extractDir });

      log.info('Extracting files...', { tarballPath });
      await extract({
        cwd: extractDir,
        file: tarballPath,
      });
      log.info('Files extracted successfully.', { tarballPath });

      log.info('Moving files to node_modules directory...', { extractDir });
      const packageDir = path.join(extractDir, 'package');
      const targetDir = scope ?
        path.join(nodeModulesDir, scope, name.split('@')[0]) :
        path.join(nodeModulesDir, pkgName.split('@')[0]);
      log.info('Target directory:', { targetDir });
      log.info('Package directory:', { packageDir });

      if (scope) {
        log.info('Creating scoped directory...', { scope });
        await fs.promises.mkdir(path.join(nodeModulesDir, scope), { recursive: true });
        log.info('Scoped directory created successfully.', { scope });
      }

      if (fs.existsSync(targetDir)) {
        log.info('Target directory already exists, removing it...', { targetDir });
        await fs.promises.rm(targetDir, {
          force: true,
          recursive: true,
        });
        log.info('Target directory removed successfully.', { targetDir });
      }

      log.info('Moving files to target directory...', { packageDir, targetDir });
      await fs.promises.rename(packageDir, targetDir);
      log.info('Files moved successfully.', { packageDir, targetDir });
    }

    log.info('Cleaning up temporary files...');
    await fs.promises.rm(tempDir, {
      force: true,
      recursive: true,
    });
    log.info('Finished cleaning up temporary files.');

    log.info('Creating symlinks for executables...');
    await _symlinkExecutables();
    log.info('Symlinks created successfully.');

    log.info('Playwright download completed successfully!');
  } catch (error) {
    log.error('Error downloading Playwright:', error);
    throw error;
  }
};

/**
 * Downloads a file from a URL to a specified path
 * @param url - URL to download from
 * @param destPath - Path to save the file
 */
const _downloadFile = async (url: string, destPath: string): Promise<void> => {
  try {
    log.info('Fetching file from URL:', { url });
    const response = await fetch(url, { agent: null });
    log.info('File fetched successfully:', { response });

    if (!response.ok) {
      throw new Error(`Failed to download, status code: ${response.status}`);
    }

    log.info('Creating write stream...', { destPath });
    const fileStream = fs.createWriteStream(destPath);
    log.info('Write stream created successfully.', { destPath });
    log.info('Starting to pipe response to file stream...', { destPath });
    await pipeline(response.body, fileStream);
    log.info('Piping completed successfully.', { destPath });
  } catch (error) {
    throw new Error(`Download failed for ${url}: ${(error as Error).message}`);
  }
};

const _symlinkExecutables = async (): Promise<void> => {
  /**
   * The equivalent of the following 2 commands need to be implemented here:
   * ln -s ../@playwright/test/cli.js node_modules/.bin/playwright
   * ln -s ../playwright-core/cli.js node_modules/.bin/playwright-core
   *
   * such that the result will be
   * lrwxr-xr-x  1 user  staff  26 ... playwright -> ../@playwright/test/cli.js
   * lrwxr-xr-x  1 user  staff  25 ... playwright-core -> ../playwright-core/cli.js
   */
  const nodeModulesDir = path.join(USER_DATA_PATH, 'node_modules');
  const binDir = path.join(nodeModulesDir, '.bin');

  // Create .bin directory if it doesn't exist
  await fs.promises.mkdir(binDir, { recursive: true });

  const playwrightSymlink = path.join(binDir, 'playwright');
  const playwrightCoreSymlink = path.join(binDir, 'playwright-core');

  const playwrightTarget = path.join('..', '@playwright', 'test', 'cli.js');
  const playwrightCoreTarget = path.join('..', 'playwright-core', 'cli.js');

  // Remove existing symlinks if they exist
  try {
    await fs.promises.unlink(playwrightSymlink);
  } catch (error) {
    // Ignore error if the symlink doesn't exist
  }

  try {
    await fs.promises.unlink(playwrightCoreSymlink);
  } catch (error) {
    // Ignore error if the symlink doesn't exist
  }

  await fs.promises.symlink(playwrightTarget, playwrightSymlink);
  await fs.promises.symlink(playwrightCoreTarget, playwrightCoreSymlink);

  log.info('Symlinks created successfully.', {
    playwrightCoreSymlink,
    playwrightCoreTarget,
    playwrightSymlink,
    playwrightTarget,
  });
};
