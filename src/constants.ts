export const
  ACTIVATE = 'activate',
  API = 'api',
  CHECK_FOR_UPDATES = 'check_for_updates',
  CONNECTED = 'connected',
  DATA = 'data',
  DISCONNECTED = 'disconnected',
  INIT_AGENT_LOG = 'initAgentLog',
  IS_AGENT_CONNECTED = 'isAgentConnected',
  MESSAGE = 'message',
  READY = 'ready',
  START_AGENT = 'startAgent',
  STDERR = 'stderr',
  STDOUT = 'stdout',
  STOP_AGENT = 'stopAgent',
  UPDATE_DOWNLOADED = 'update-downloaded',
  UPDATE_NOT_AVAILABLE = 'update-not-available',
  WINDOW_ALL_CLOSED = 'window-all-closed';

export const PLATFORM: { [platform: string]: NodeJS.Platform; } = {
  DARWIN: 'darwin',
};

export const LINK_TO_LOADMILL_SECURITY = 'https://app.loadmill.com/app/user/settings/security';
export const LINK_TO_LOADMILL_AGENT_DOCS = 'https://docs.loadmill.com/integrations/testing-localhost-application';
export const LOADMILL_AGENT = 'loadmill-agent';
