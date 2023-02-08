import { MainMessage } from '../../types/messaging';
import { CLEAR_ALL_ENTRIES, DELETE_ENTRY } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { clearEntries, deleteEntry } from './entries';

export const subscribeToClearEntriesFromRenderer = (): void => {
  subscribeToMainProcessMessage(CLEAR_ALL_ENTRIES, clearEntries);
};

export const subscribeToDeleteEntryFromRenderer = (): void => {
  subscribeToMainProcessMessage(DELETE_ENTRY, (_event: Electron.IpcMainEvent, { entryId }: MainMessage['data']) => {
    deleteEntry(entryId);
  });
};
