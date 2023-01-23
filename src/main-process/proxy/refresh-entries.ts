import { ipcMain } from 'electron';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { REFRESH_ENTRIES, UPDATED_ENTRIES } from '../../universal/constants';

import { getEntries } from './entries';

export const subscribeToRefreshEntriesFromRenderer = (): void => {
  ipcMain.on(REFRESH_ENTRIES, (_event) => {
    sendFromProxyToRenderer({
      data: { proxies: getEntries() },
      type: UPDATED_ENTRIES,
    });
  });
};
