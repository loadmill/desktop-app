import fs from 'fs';
import path from 'path';

import log from '../log';

import { STANDALONE_NPX_FOLDER_PATH } from './constants';

export const getStandaloneNpxBinaryDir = (): string => {
  const npxBinaryPath = path.join(STANDALONE_NPX_FOLDER_PATH, 'bin', 'npx');
  if (!fs.existsSync(npxBinaryPath)) {
    throw new Error(`npx binary not found at ${npxBinaryPath}`);
  }
  log.info('standalone npx binary path:', { npxBinaryPath });
  const npxBinaryDir = path.dirname(npxBinaryPath);
  log.info('standalone npx binary directory:', { npxBinaryDir });
  return npxBinaryDir;
};
