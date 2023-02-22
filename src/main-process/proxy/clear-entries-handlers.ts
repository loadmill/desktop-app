import { MainMessage } from '../../types/messaging';
import { CLEAR_ALL_ENTRIES, DELETE_ENTRIES, DELETE_ENTRY } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { clearEntries, deleteEntries, deleteEntry } from './entries';
import { sendUpdatedEntries } from './refresh-entries';

export const subscribeToClearEntriesEvents = (): void => {
  subscribeToClearEntries();
  subscribeToDeleteEntry();
  subscribeToDeleteEntries();
};

const subscribeToClearEntries = (): void => {
  subscribeToMainProcessMessage(CLEAR_ALL_ENTRIES, clearEntries);
};

const subscribeToDeleteEntry = (): void => {
  subscribeToMainProcessMessage(DELETE_ENTRY, (_event: Electron.IpcMainEvent, { entryId }: MainMessage['data']) => {
    deleteEntry(entryId);
    sendUpdatedEntries();
  });
};

const subscribeToDeleteEntries = (): void => {
  subscribeToMainProcessMessage(DELETE_ENTRIES, (_event: Electron.IpcMainEvent, { entryIds }: MainMessage['data']) => {
    deleteEntries(entryIds);
    sendUpdatedEntries();
  });
};
