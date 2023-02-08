
import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { REFRESH_ENTRIES, UPDATED_ENTRIES } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { getEntries } from './entries';

export const subscribeToRefreshEntriesFromRenderer = (): void => {
  subscribeToMainProcessMessage(REFRESH_ENTRIES, () => {
    sendFromProxyToRenderer({
      data: { proxies: getEntries() },
      type: UPDATED_ENTRIES,
    });
  });
};
