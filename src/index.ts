import {
  app,
  BrowserWindow,
  shell
} from 'electron';

import { subscribeToAgentEventsFromRenderer } from './agent-handlers';
import {
  ACTIVATE,
  BEFORE_QUIT,
  CLOSE,
  MAIN_WINDOW_ID,
  PLATFORM,
  READY,
  WINDOW_ALL_CLOSED
} from './constants';
import { createLoadmillWebView } from './loadmill-web-app-browserview';
import log from './log';
import {
  init as initMainToRenderer, sendToRenderer
} from './main-to-renderer';
import './menu';
import {
  subscribeToToggleMaximizeWindow
} from './screen-size';
import { initStore } from './store';
import { initUpdater } from './update-electron-app';

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
let mainWindow: BrowserWindow;
let forceQuit = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const onReady = () => {
  initStore();
  subscribeToAgentEventsFromRenderer();
  createWindow();
};

const createWindow = () => {
  log.info('creating window');
  mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 15 },
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  initUpdater(unsubscribeToCloseEvent);
  subscribeToCloseEvent();
  mainWindow.maximize();
  initMainToRenderer(mainWindow);
  sendToRenderer({
    data: { mainWindowId: mainWindow.webContents.id },
    type: MAIN_WINDOW_ID,
  });
  setOpenLinksInBrowser(mainWindow);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  subscribeToToggleMaximizeWindow(mainWindow);
  // mainWindow.webContents.openDevTools();
  createLoadmillWebView(mainWindow);
};

const setOpenLinksInBrowser = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

app.on(BEFORE_QUIT, () => {
  forceQuit = true;
});

app.on(READY, onReady);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on(WINDOW_ALL_CLOSED, () => {
  if (process.platform !== PLATFORM.DARWIN) {
    app.quit();
  }
});

app.on(ACTIVATE, () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

const unsubscribeToCloseEvent = () => {
  mainWindow.removeListener(CLOSE, () => {});
};

const subscribeToCloseEvent = () => {
  if (mainWindow) {
    mainWindow.on(CLOSE, (event: Electron.Event) => {
      if (!forceQuit && process.platform === PLATFORM.DARWIN) {
        if (!forceQuit) {
          event.preventDefault();
          mainWindow.hide();
        }
      }
    });
  }
};
