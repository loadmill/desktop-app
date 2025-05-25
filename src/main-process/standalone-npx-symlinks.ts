import fs from 'fs';
import path from 'path';

import log from '../log';

import { STANDALONE_NPX_FOLDER_PATH } from './constants';

export const createStandaloneNpxSymlinks = (): void => {
  log.info('Creating symlinks for standalone npx');
  log.info({ STANDALONE_NPX_FOLDER_PATH });

  const binDir = path.join(STANDALONE_NPX_FOLDER_PATH, 'bin');

  // Ensure bin directory exists
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

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
