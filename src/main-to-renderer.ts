/**
 * This module provides a nice interface to send messages from main process to renderer process.
 */
import { BrowserWindow } from 'electron';

import log from './log';
import { RendererMessage } from './types/messaging';

const MainToRender = {
  mainWindow: null as BrowserWindow,
};

export const init = (mainWindow: BrowserWindow): void => {
  MainToRender.mainWindow = mainWindow;
};

export const sendToRenderer = ({ type, data }: RendererMessage): void => {
  try {
    if (MainToRender.mainWindow?.webContents) {
      log.debug('Sending to renderer', { data, type });
      MainToRender.mainWindow.webContents.send(type, data);
    } else {
      log.warn('Cannot send from Main process to Renderer Process. Reason: No mainWindow on MainToRender object.', {
        data, type
      });
    }
  } catch (e) {
    log.error('error in send main to renderer', e);
  }
};
