import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import log from '../../log';
import { STANDALONE_NPX_DIR_PATH } from '../constants';

export const createStandaloneNpxSymlinks = (): void => {
  try {
    log.info('Creating symlinks for standalone npx');
    log.info({ STANDALONE_NPX_FOLDER_PATH: STANDALONE_NPX_DIR_PATH });

    if (os.platform() === 'win32') {
      createStandaloneNpxSymlinksWindows();
      return;
    }
    createStandaloneNpxSymlinksUnix();
  } catch (error) {
    log.error('Failed to create standalone npx symlinks');
    log.error(error);
  }
};

const createStandaloneNpxSymlinksWindows = () => {
  log.info('Standalone npx binary directory', { binDir: STANDALONE_NPX_DIR_PATH });

  if (!fs.existsSync(STANDALONE_NPX_DIR_PATH)) {
    fs.mkdirSync(STANDALONE_NPX_DIR_PATH, { recursive: true });
  }

  const nodePath = path.resolve(process.execPath);
  log.info({ execPath: nodePath });

  const symlinks = [
    {
      link: path.join(STANDALONE_NPX_DIR_PATH, 'node'),
      target: nodePath,
    },
    {
      link: path.join(STANDALONE_NPX_DIR_PATH, 'npm'),
      target: path.join(STANDALONE_NPX_DIR_PATH, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    },
    {
      link: path.join(STANDALONE_NPX_DIR_PATH, 'npx'),
      target: path.join(STANDALONE_NPX_DIR_PATH, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    },
  ];

  for (const { target, link } of symlinks) {
    // Clean up existing files
    if (fs.existsSync(link)) {
      fs.unlinkSync(link);
    }
    if (fs.existsSync(`${link}.cmd`)) {
      fs.unlinkSync(`${link}.cmd`);
    }
    if (fs.existsSync(`${link}.ps1`)) {
      fs.unlinkSync(`${link}.ps1`);
    }

    createWindowsLink(target, link, nodePath);
  }
};

// Helper function to try creating symlink with fallback to alternatives
const createWindowsLink = (target: string, link: string, nodePath: string): boolean => {
  try {
    // First try creating a symlink
    fs.symlinkSync(target, link);
    log.info(`Created symlink: ${link} -> ${target}`);
    return true;
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'ENOENT') {
      log.warn(`Symlink failed (${error.code}), falling back to script wrappers for: ${link}`);

      // Create both .cmd and .ps1 files as fallbacks
      const batchPath = `${link}.cmd`;
      const ps1Path = `${link}.ps1`;

      // Clean up existing files
      if (fs.existsSync(batchPath)) {
        fs.unlinkSync(batchPath);
      }
      if (fs.existsSync(ps1Path)) {
        fs.unlinkSync(ps1Path);
      }

      createBatchWrapper(batchPath, target, nodePath);
      createPowerShellWrapper(ps1Path, target, nodePath);
      return true;
    } else {
      throw error;
    }
  }
};

// Helper function to create a batch file wrapper for Windows
const createBatchWrapper = (batchPath: string, targetPath: string, nodePath: string) => {
  log.info(`Creating batch wrapper: ${batchPath} -> ${targetPath}`);
  let batchContent;

  if (targetPath.endsWith('.js')) {
    // For .js files, we need to invoke them with node and set ELECTRON_RUN_AS_NODE
    batchContent = `@echo off\nset ELECTRON_RUN_AS_NODE=1\n"${nodePath}" "${targetPath}" %*\n`;
  } else {
    // For executables, set the env var and invoke directly
    batchContent = `@echo off\nset ELECTRON_RUN_AS_NODE=1\n"${targetPath}" %*\n`;
  }

  fs.writeFileSync(batchPath, batchContent);
  log.info(`Created batch wrapper: ${batchPath} -> ${targetPath}`);
};

// Helper function to create a PowerShell wrapper for Windows
const createPowerShellWrapper = (ps1Path: string, targetPath: string, nodePath: string) => {
  log.info(`Creating PowerShell wrapper: ${ps1Path} -> ${targetPath}`);
  let ps1Content;

  if (targetPath.endsWith('.js')) {
    // For .js files, we need to invoke them with node and set ELECTRON_RUN_AS_NODE
    log.info('Creating PowerShell wrapper for JS file');
    ps1Content = `$env:ELECTRON_RUN_AS_NODE = "1"
& "${nodePath}" "${targetPath}" $args
`;
  } else {
    // For executables, set the env var and invoke directly
    log.info('Creating PowerShell wrapper for executable');
    ps1Content = `$env:ELECTRON_RUN_AS_NODE = "1"
& "${targetPath}" $args
`;
  }

  fs.writeFileSync(ps1Path, ps1Content);
  log.info(`Created PowerShell wrapper: ${ps1Path} -> ${targetPath}`);
};

const createStandaloneNpxSymlinksUnix = () => {
  const binDir = path.join(STANDALONE_NPX_DIR_PATH, 'bin');

  log.info('Standalone npx binary directory', { binDir });

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  log.info({ execPath: process.execPath });
  log.info({ resolveExecPath: path.resolve(process.execPath) });

  const symlinks = [
    {
      link: path.join(binDir, 'node'),
      target: path.resolve(process.execPath),
    },
    {
      link: path.join(binDir, 'npm'),
      target: '../lib/node_modules/npm/bin/npm-cli.js',
    },
    {
      link: path.join(binDir, 'npx'),
      target: '../lib/node_modules/npm/bin/npx-cli.js',
    },
  ];

  for (const { target, link } of symlinks) {
    if (fs.existsSync(link)) {
      fs.unlinkSync(link);
    }

    log.info(`Creating symlink: ${link} -> ${target}`);
    fs.symlinkSync(target, link);
  }
};

/**
 * Attempts to resolve the standalone npx binary directory
 * and prepend it to the current PATH.
 *
 * @returns {string} The updated PATH with the standalone npx binary directory.
 */
export const getEnvPathWithStandaloneNpx = (): string => {
  log.info('process.env.PATH:', process.env.PATH);

  const npxDir = getStandaloneNpxBinaryDir();
  if (!npxDir) {
    log.error('Standalone npx binary directory not found');
    return process.env.PATH || '';
  }

  const pathWithStandaloneNpx = npxDir + path.delimiter + process.env.PATH;
  log.info('PATH with standalone npx', { pathWithStandaloneNpx });

  const whichNpx = spawnSync('which', ['npx'], { env: { ...process.env, PATH: pathWithStandaloneNpx } });
  log.info('Resolved npx:', whichNpx.stdout.toString());

  return pathWithStandaloneNpx;
};

const getStandaloneNpxBinaryDir = (): string | undefined => {
  const npxBinaryPath = path.join(STANDALONE_NPX_DIR_PATH, 'bin', 'npx');
  if (!fs.existsSync(npxBinaryPath)) {
    log.error('npx binary not found', { npxBinaryPath });
    return;
  }
  log.info('standalone npx binary path', { npxBinaryPath });
  const npxBinaryDir = path.dirname(npxBinaryPath);
  log.info('standalone npx binary directory', { npxBinaryDir });
  return npxBinaryDir;
};
