import { config } from 'dotenv';
import { app } from 'electron';

config();

export const LOADMILL_AGENT_SERVER_URL = process.env.LOADMILL_AGENT_SERVER_URL;
export const LOADMILL_AGENT_VERBOSE = process.env.LOADMILL_AGENT_VERBOSE;
export const LOADMILL_WEB_APP_ORIGIN = process.env.LOADMILL_WEB_APP_ORIGIN || 'https://app.loadmill.com';
export const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
export const NODE_OPTIONS = process.env.NODE_OPTIONS || '--http-parser=legacy  --max-http-header-size=20000';

export const DOWNLOADS_PATH = app.getPath('downloads');
export const USER_DATA_PATH = app.getPath('userData');

export const PACKED_RELATIVE_PATH = app.getAppPath() + '/.webpack/main/';
export const LOADMILL_AGENT = 'loadmill-agent';
export const LOADMILL_AGENT_PATH = PACKED_RELATIVE_PATH + LOADMILL_AGENT;

export const PROXY_CERTIFICATES_DIR_PATH = USER_DATA_PATH + '/proxy/';
export const PROXY_CERTIFICATE_PATH = PROXY_CERTIFICATES_DIR_PATH + 'certs/ca.pem';
export const PROXY_CERTIFICATE_SAVE_PATH = DOWNLOADS_PATH + '/loadmill-proxy-certificate.pem';

export const AGENT_LOG_FILENAME = 'agent.log';
export const FULL_AGENT_LOG_PATH = `${USER_DATA_PATH}/${AGENT_LOG_FILENAME}`;
export const AGENT_LOG_SAVE_PATH = DOWNLOADS_PATH + '/loadmill-private-agent.log';
