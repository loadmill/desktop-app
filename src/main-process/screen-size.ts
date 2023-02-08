import { BrowserView, BrowserWindow, ipcMain } from 'electron';

import { TOGGLE_MAXIMIZE_WINDOW } from '../universal/constants';

export const subscribeToToggleMaximizeWindow = (mainWindow: BrowserWindow): void => {
  ipcMain.on(TOGGLE_MAXIMIZE_WINDOW, (_event: Electron.IpcMainEvent) => {
    if (mainWindow) {
      mainWindow.isMaximized() ?
        mainWindow.unmaximize() :
        mainWindow.maximize();
    }
  });
};

const TITLE_BAR_HEIGHT = 44;

export const setBrowserViewSize = (view: BrowserView, bounds: Electron.Rectangle): void => {
  view.setBounds({
    height: bounds.height - TITLE_BAR_HEIGHT,
    width: bounds.width,
    x: 0,
    y: TITLE_BAR_HEIGHT,
  });
};
