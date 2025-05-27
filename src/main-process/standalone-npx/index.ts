import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import log from '../../log';
import { STANDALONE_NPX_DIR_PATH } from '../constants';

export const createStandaloneNpxSymlinks = (): void => {
  try {
    log.info('Creating symlinks for standalone npx');
    log.info({ STANDALONE_NPX_FOLDER_PATH: STANDALONE_NPX_DIR_PATH });

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
  } catch (error) {
    log.error('Failed to create standalone npx symlinks');
    log.error(error);
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
