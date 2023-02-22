export const
  ACTIVATE = 'activate',
  BEFORE_QUIT = 'before-quit',
  CLEAR_ALL_ENTRIES = 'clearAllEntries',
  CLOSE = 'close',
  DATA = 'data',
  DELETE_ENTRY = 'deleteEntry',
  DESKTOP_API = 'desktopApi',
  DID_NAVIGATE = 'did-navigate',
  DID_NAVIGATE_IN_PAGE = 'did-navigate-in-page',
  DISCONNECTED = 'disconnected',
  DOWNLOADED_CERTIFICATE_SUCCESS = 'downloadedCertificateSuccess',
  DOWNLOAD_CERTIFICATE = 'downloadCertificate',
  EXPORTED_AS_HAR_SUCCESS = 'exportedAsHarSuccess',
  EXPORT_AS_HAR = 'exportAsHar',
  FETCH_SUITES = 'fetchSuites',
  FILTER_REGEX = 'filterRegex',
  FIND_NEXT = 'findNext',
  GENERATE_TOKEN = 'generateToken',
  GET_IP_ADDRESS = 'getIpAddress',
  GO_BACK = 'goBack',
  GO_FORWARD = 'goForward',
  INIT_FILTER_REGEX = 'initFilterRegex',
  IP_ADDRESS = 'ipAddress',
  IS_AGENT_CONNECTED = 'isAgentConnected',
  IS_RECORDING = 'isRecording',
  LOADMILL_DESKTOP = 'loadmillDesktop',
  LOADMILL_VIEW_ID = 'loadmillViewId',
  MAIN_WINDOW_ID = 'mainWindowId',
  MESSAGE = 'message',
  NAVIGATION = 'navigation',
  PROXY = 'proxy',
  READY = 'ready',
  REFRESH_ENTRIES = 'refreshEntries',
  REFRESH_PAGE = 'refreshPage',
  RESIZE = 'resize',
  SAVED_TOKEN = 'savedToken',
  SET_FILTER_REGEX = 'setFilterRegex',
  SET_IS_RECORDING = 'setIsRecording',
  SET_IS_USER_SIGNED_IN = 'setIsUserSignedIn',
  SHOW_FIND_ON_PAGE = 'showFindOnPage',
  START_AGENT = 'startAgent',
  STOP_AGENT = 'stopAgent',
  SWITCH_VIEW = 'switchView',
  TOGGLE_MAXIMIZE_WINDOW = 'toggleMaximizeWindow',
  TOKEN = 'token',
  UPDATED_ENTRIES = 'updatedEntries',
  UPDATED_SUITES = 'updatedSuites',
  UPDATE_DOWNLOADED = 'update-downloaded',
  UPDATE_NOT_AVAILABLE = 'update-not-available',
  WINDOW_ALL_CLOSED = 'window-all-closed';

export const PLATFORM: { [platform: string]: NodeJS.Platform; } = {
  DARWIN: 'darwin',
};
