import { ipcMain } from 'electron';

import { MainMessage, MainMessageTypes } from '../types/messaging';

export const subscribeToMainProcessMessage = (
  type: MainMessageTypes,
  handler: (event?: Electron.IpcMainEvent, data?: MainMessage['data']) => void,
): void => {
  ipcMain.on(type, handler);
};
