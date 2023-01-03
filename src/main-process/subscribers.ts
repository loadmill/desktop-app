import { ipcMain } from 'electron';

import { MainMessage } from '../types/messaging';

export const subscribeToMainMessage = (
  { data, type }: MainMessage,
  handler: (event: Electron.IpcMainEvent, data: MainMessage['data']) => void,
): void => {
  ipcMain.on(
    type,
    (event: Electron.IpcMainEvent) => handler(event, data),
  );
};
