export const
  ACTIVATE = 'activate',
  BEFORE_QUIT = 'before-quit',
  CLOSE = 'close',
  DATA = 'data',
  DID_NAVIGATE = 'did-navigate',
  DID_NAVIGATE_IN_PAGE = 'did-navigate-in-page',
  DISCONNECTED = 'disconnected',
  GENERATE_TOKEN = 'generateToken',
  GENERATE_TOKEN_LOADMILL_VIEW = 'generateTokenLoadmillView',
  GO_BACK = 'goBack',
  GO_FORWARD = 'goForward',
  IS_AGENT_CONNECTED = 'isAgentConnected',
  LOADMILL_DESKTOP = 'loadmillDesktop',
  LOADMILL_VIEW_ID = 'loadmillViewId',
  MAIN_WINDOW_ID = 'mainWindowId',
  MESSAGE = 'message',
  NAVIGATION = 'navigation',
  NEW_TOKEN = 'newToken',
  READY = 'ready',
  REFRESH_PAGE = 'refreshPage',
  RESIZE = 'resize',
  SAVED_TOKEN = 'savedToken',
  SAVED_TOKEN_LOADMILL_VIEW = 'savedTokenLoadmillView',
  SET_IS_USER_SIGNED_IN = 'setIsUserSignedIn',
  START_AGENT = 'startAgent',
  STOP_AGENT = 'stopAgent',
  TOGGLE_MAXIMIZE_WINDOW = 'toggleMaximizeWindow',
  TOKEN = 'token',
  UPDATE_DOWNLOADED = 'update-downloaded',
  UPDATE_NOT_AVAILABLE = 'update-not-available',
  WINDOW_ALL_CLOSED = 'window-all-closed';

export const PLATFORM: { [platform: string]: NodeJS.Platform; } = {
  DARWIN: 'darwin',
};

export const LOADMILL_AGENT = 'loadmill-agent';
