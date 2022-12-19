import { BrowserWindow, ipcMain } from 'electron';

import { TOGGLE_MAXIMIZE_WINDOW } from './constants';

export const subscribeToToggleMaximizeWindow = (mainWindow: BrowserWindow): void => {
  ipcMain.on(TOGGLE_MAXIMIZE_WINDOW, (_event: Electron.IpcMainEvent) => {
    if (mainWindow) {
      mainWindow.isMaximized() ?
        mainWindow.unmaximize() :
        mainWindow.maximize();
    }
  });
};
