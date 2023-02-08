import { BrowserView, BrowserWindow } from 'electron';

import { TOGGLE_MAXIMIZE_WINDOW } from '../universal/constants';

import { subscribeToMainProcessMessage } from './main-events';

export const subscribeToToggleMaximizeWindow = (mainWindow: BrowserWindow): void => {
  subscribeToMainProcessMessage(TOGGLE_MAXIMIZE_WINDOW, () => {
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
