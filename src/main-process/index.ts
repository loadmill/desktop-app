import {
  app,
  autoUpdater,
  BrowserWindow,
} from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import {
  ACTIVATE,
  BEFORE_QUIT,
  BEFORE_QUIT_FOR_UPDATE,
  CLOSE,
  MAIN_WINDOW_ID,
  PLATFORM,
  READY,
  WINDOW_ALL_CLOSED,
} from '../universal/constants';

import { killAgentProcess, subscribeToAgentEventsFromRenderer } from './agent-handlers';
import { subscribeToCodegenEvents } from './codegen';
import './deep-link';
import { subscribeToKeybindings } from './keybindings';
import {
  getMainWindow,
  setMainWindow,
} from './main-window';
import './menu';
import { setOpenLinksInBrowser } from './open-links';
import { initStore } from './persistence-store';
import { initProxyServer } from './proxy';
import { subscribeToToggleMaximizeWindow } from './screen-size';
import { initSettingsOnStartup } from './settings';
import { collectProxyServerData } from './settings/proxy-server-data-collection';
import { initProxyAuthHandler } from './settings/proxy-server-setting';
import { symlinkPlaywright } from './standalone-playwright/symlink-playwright';
import { registerStartupProgressTarget } from './startup-progress';
import { getStartupWindow, setStartupWindow } from './startup-window';
import { initUpdater } from './update-electron-app';
import {
  initializeViews,
} from './views';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const STARTUP_WINDOW_WEBPACK_ENTRY: string;
declare const STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let forceQuit = false;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const onStartup = () => {
  log.info('App is on start up');
  initStore();
  initProxyAuthHandler();
  initSettingsOnStartup();
};

onStartup();

const onReady = async () => {
  await collectProxyServerData();
  symlinkPlaywright();
  await initProxyServer();
  subscribeToAgentEventsFromRenderer();
  subscribeToCodegenEvents();
  createWindows();
};

const createWindows = () => {
  createStartupWindow();
  createMainWindow();
};

const createStartupWindow = () => {
  log.info('Creating startup window');
  const startupWindow = new BrowserWindow({
    webPreferences: {
      preload: STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  subscribeToCloseEvent(startupWindow, () => setStartupWindow(null));
  startupWindow.loadURL(STARTUP_WINDOW_WEBPACK_ENTRY);
  setStartupWindow(startupWindow);
  registerStartupProgressTarget(startupWindow, 'startupWindow');
};

const subscribeToCloseEvent = (window: BrowserWindow, onForceQuit: () => void) => {
  if (window) {
    window.on(CLOSE, onWindowClose(window, onForceQuit));
  }
};

const onWindowClose = (window: BrowserWindow, onForceQuit: () => void) => (event: Electron.Event) => {
  if (forceQuit) {
    onForceQuit();
  } else if (process.platform === PLATFORM.DARWIN) {
    event.preventDefault();
    window.hide();
  }
};

const createMainWindow = () => {
  log.info('Creating main window');
  const mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 15 },
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  setMainWindow(mainWindow);
  initUpdater(unsubscribeToCloseEvent);
  subscribeToCloseEvent(mainWindow, () => setMainWindow(null));
  sendMainWindowIdToRenderer(mainWindow);
  setOpenLinksInBrowser(mainWindow.webContents);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  subscribeToToggleMaximizeWindow(mainWindow);
  initializeViews(mainWindow);
  subscribeToKeybindings();
};

const unsubscribeToCloseEvent = () => {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.removeListener(CLOSE, () => { });
  }
};

const sendMainWindowIdToRenderer = (mainWindow: BrowserWindow) => {
  sendFromMainWindowToRenderer({
    data: { mainWindowId: mainWindow.webContents.id },
    type: MAIN_WINDOW_ID,
  });
};

const onActivate = () => {
  try {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    } else {
      const startupWindowShown = showStartupWindowIfExists();
      if (!startupWindowShown) {
        showMainWindowIfExists();
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot create BrowserWindow before app is ready')) {
      log.warn('Tried to show main window before app was ready, probably dock icon is clicked too early');
    } else {
      throw error;
    }
  }
};

const showStartupWindowIfExists = () => {
  const startupWindow = getStartupWindow();
  if (startupWindow && !startupWindow.isDestroyed()) {
    if (!startupWindow.isVisible()) {
      startupWindow.show();
    }
    startupWindow.focus();
    return true;
  }
  return false;
};

const showMainWindowIfExists = () => {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.show();
  }
};

app.on(READY, onReady);

app.on(BEFORE_QUIT, () => {
  log.info('App is quitting');
  killAgentProcess();
  forceQuit = true;
});

autoUpdater.on(BEFORE_QUIT_FOR_UPDATE, () => {
  forceQuit = true;
});

app.on(WINDOW_ALL_CLOSED, () => {
  if (process.platform !== PLATFORM.DARWIN) {
    app.quit();
  }
});

app.on(ACTIVATE, onActivate);
