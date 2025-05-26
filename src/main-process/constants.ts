import path from 'path';

import { config } from 'dotenv';
import { app } from 'electron';

config();

export const LOADMILL_AGENT_VERBOSE = process.env.LOADMILL_AGENT_VERBOSE;
export const UI_TESTS_ENABLED = process.env.UI_TESTS_ENABLED || 'true';
const STANDALONES_PATH = process.env.NODE_ENV === 'production' ? process.resourcesPath : app.getAppPath();
export const STANDALONE_NPX_DIR_PATH = path.join(STANDALONES_PATH, 'standalone_npx');
export const STANDALONE_PLAYWRIGHT_DIR_PATH = path.join(STANDALONES_PATH, 'standalone_playwright');
export const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
export const NODE_OPTIONS = process.env.NODE_OPTIONS || '--http-parser=legacy  --max-http-header-size=20000';
