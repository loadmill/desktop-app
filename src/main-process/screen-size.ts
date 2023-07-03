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

/*
Try to use this logic:

// Get the bounds of the parent window's content area
    const { x, y, width, height } = mainWindow.getContentBounds()
    const topSpace = TITLE_BAR_HEIGHT
    const bottomSpace = TITLE_BAR_HEIGHT

    // Subtract the top and bottom space from the height
    const viewHeight = height - topSpace - bottomSpace

    view.setBounds({ x, y: y + topSpace, width, height: viewHeight })
*/

export const setBrowserViewSize = (view: BrowserView, bounds: Electron.Rectangle): void => {
  const { width, height } = bounds;
  const boundsHeight = process.platform === 'win32' ? height - (TITLE_BAR_HEIGHT * 2) : height - TITLE_BAR_HEIGHT;
  view.setBounds({
    height: boundsHeight,
    width,
    x: 0,
    y: TITLE_BAR_HEIGHT,
  });
};
