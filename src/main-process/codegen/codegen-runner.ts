import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';

import { PLAYWRIGHT_TEST_PACKAGE_CLI_PATH_FOR_CODEGEN } from '../constants';

import { forkAsync } from './fork-async';

export const runPlaywrightCodegen = async (url?: string): Promise<string> => {
  const tempFile = path.join(tmpdir(), `playwright-codegen-${Date.now()}.js`);
  const args: string[] = ['codegen'];
  if (url) {
    args.push(url);
  }
  args.push('--output', tempFile);
  args.push('--test-id-attribute=data-testid');
  try {
    await forkAsync(PLAYWRIGHT_TEST_PACKAGE_CLI_PATH_FOR_CODEGEN, args, {
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: '0',
      },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });
    const content = await fs.readFile(tempFile, 'utf-8');
    await fs.unlink(tempFile);
    return content;
  } catch (error) {
    await fs.unlink(tempFile).catch(() => { });
    throw error;
  }
};
