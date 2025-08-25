import { BrowserWindow, WebContentsView } from 'electron';

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
const HEIGHT_OFFSET = process.platform === 'win32' ? (TITLE_BAR_HEIGHT * 2) : TITLE_BAR_HEIGHT;

export const setBrowserViewSize = (view: WebContentsView, bounds: Electron.Rectangle): void => {
  const { width, height } = bounds;

  view.setBounds({
    height: height - HEIGHT_OFFSET,
    width,
    x: 0,
    y: TITLE_BAR_HEIGHT,
  });
};
