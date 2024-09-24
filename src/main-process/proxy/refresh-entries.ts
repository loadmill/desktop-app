
import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { REFRESH_ENTRIES, UPDATED_ENTRIES } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { getEntries } from './entries';

export const subscribeToRefreshEntriesFromRenderer = (): void => {
  subscribeToMainProcessMessage(REFRESH_ENTRIES, () => {
    sendUpdatedEntries();
  });
};

export const sendUpdatedEntries = (): void => {
  sendFromProxyViewToRenderer({
    data: { proxies: getEntries() },
    type: UPDATED_ENTRIES,
  });
};
