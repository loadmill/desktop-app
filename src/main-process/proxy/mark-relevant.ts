import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { MainMessage } from '../../types/messaging';
import { MARK_RELEVANT, UPDATED_ENTRIES } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { getEntries } from './entries';

export const subscribeToMarkRelevant = (): void => {
  subscribeToMainProcessMessage(MARK_RELEVANT, markRelevant);
};

const markRelevant = (_event: Electron.IpcMainEvent, { entryIds }: MainMessage['data']): void => {
  const entries = getEntries();
  entries.forEach((entry) => {
    if (entryIds.includes(entry.id)) {
      entry.irrelevant = false;
    }
  });
  sendFromProxyViewToRenderer({
    data: { proxies: entries },
    type: UPDATED_ENTRIES,
  });
};
