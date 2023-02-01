import { ipcMain } from 'electron';

import { MainMessage } from '../../types/messaging';
import { CLEAR_ALL_ENTRIES, DELETE_ENTRY } from '../../universal/constants';

import { clearEntries, deleteEntry } from './entries';

export const subscribeToClearEntriesFromRenderer = (): void => {
  ipcMain.on(CLEAR_ALL_ENTRIES, (_event: Electron.IpcMainEvent) => {
    clearEntries();
  });
};

export const subscribeToDeleteEntryFromRenderer = (): void => {
  ipcMain.on(DELETE_ENTRY, (_event: Electron.IpcMainEvent, { entryId }: MainMessage['data']) => {
    deleteEntry(entryId);
  });
};
