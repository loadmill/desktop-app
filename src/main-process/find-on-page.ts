import { ipcMain, WebContents } from 'electron';

import { MainMessage } from '../types/messaging';
import { FIND_NEXT } from '../universal/constants';

export const subscribeToFindOnPageEvents = (webContents: WebContents): void => {
  subscribeToFoundInPageEvent(webContents);
  subscribeToFindNextFromRenderer(webContents);
};

const subscribeToFoundInPageEvent = (webContents: WebContents): void => {
  webContents.on('found-in-page', (_event: Electron.Event, _result: Electron.Result) => {
    // TODO: improve the traversal between each found result
  });
};

const subscribeToFindNextFromRenderer = (webContents: WebContents): void => {
  ipcMain.on(FIND_NEXT, (_event: Electron.IpcMainEvent, { toFind }: MainMessage['data']) => {
    if (toFind) {
      webContents.findInPage(toFind, {
        findNext: true,
      });
    } else {
      webContents.stopFindInPage('clearSelection');
    }
  });
};
