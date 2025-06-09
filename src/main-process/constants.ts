
import { config } from 'dotenv';

config();

export const LOADMILL_AGENT_VERBOSE = process.env.LOADMILL_AGENT_VERBOSE;
export const UI_TESTS_ENABLED = process.env.UI_TESTS_ENABLED;
export const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
export const NODE_OPTIONS = process.env.NODE_OPTIONS || '--http-parser=legacy  --max-http-header-size=20000';
