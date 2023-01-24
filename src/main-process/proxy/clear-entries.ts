import { ipcMain } from 'electron';

import { CLEAR_ALL_ENTRIES } from '../../universal/constants';

import { clearEntries } from './entries';

export const subscribeToClearEntriesFromRenderer = (): void => {
  ipcMain.on(CLEAR_ALL_ENTRIES, (_event: Electron.IpcMainEvent) => {
    clearEntries();
  });
};
