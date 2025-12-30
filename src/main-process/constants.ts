import path from 'path';

import { config } from 'dotenv';
import { app } from 'electron';

config();

export const USER_DATA_PATH = app.getPath('userData');
export const LOADMILL_AGENT_VERBOSE = process.env.LOADMILL_AGENT_VERBOSE || 'true';
export const UI_TESTS_ENABLED = process.env.UI_TESTS_ENABLED || 'true';
const STANDALONES_PATH = process.env.NODE_ENV === 'production' ? process.resourcesPath : app.getAppPath();
export const STANDALONE_PLAYWRIGHT_DIR_PATH = path.join(STANDALONES_PATH, 'standalone_playwright');
export const PLAYWRIGHT_TEST_PACKAGE_CLI_PATH = path.join(STANDALONE_PLAYWRIGHT_DIR_PATH, 'node_modules', '@playwright', 'test', 'cli.js');
export const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
export const NODE_OPTIONS = process.env.NODE_OPTIONS || '--http-parser=legacy  --max-http-header-size=20000';
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const PLAYWRIGHT_TEST_PACKAGE_CLI_PATH_FOR_CODEGEN = path.join(
  STANDALONE_PLAYWRIGHT_DIR_PATH,
  'node_modules', '@playwright', 'test', 'cli.js');
export const USER_DATA_NODE_MODULES_PATH = path.join(USER_DATA_PATH, 'node_modules');
