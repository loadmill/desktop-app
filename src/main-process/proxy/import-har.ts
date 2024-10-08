import fs from 'fs';

import { dialog } from 'electron';

import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { Har } from '../../types/har';
import { IMPORT_HAR, IMPORT_HAR_IS_IN_PROGRESS, UPDATED_ENTRIES } from '../../universal/constants';
import { harToProxyEntries } from '../har-to-proxy/har-to-proxy';
import { subscribeToMainProcessMessage } from '../main-events';

import { appendEntries, clearEntries, getEntries } from './entries';

export const subscribeToImportHar = (): void => {
  subscribeToMainProcessMessage(IMPORT_HAR, onImportHar);
};

const onImportHar = () => {
  log.info('onImportHar');
  const filePaths = dialog.showOpenDialogSync({
    filters: [{
      extensions: ['har'],
      name: 'HAR',
    }],
    properties: ['openFile'],
  });

  if (Array.isArray(filePaths) && filePaths.length === 1 && filePaths[0].length > 0) {
    sendFromProxyViewToRenderer({ type: IMPORT_HAR_IS_IN_PROGRESS });
    try {
      const harAsTextBuffer = fs.readFileSync(filePaths[0]);
      const harAsText = harAsTextBuffer.toString();
      const harAsJson = JSON.parse(harAsText) as Har;
      const proxyEntries = harToProxyEntries(harAsJson);

      clearEntries();
      appendEntries(proxyEntries);

      sendFromProxyViewToRenderer({
        data: {
          proxies: getEntries(),
        },
        type: UPDATED_ENTRIES,
      });
      sendFromProxyViewToRenderer({ type: IMPORT_HAR });
    } catch (e) {
      log.error('Error while parsing HAR file', e);
      sendFromProxyViewToRenderer({
        data: {
          error: e,
        },
        type: IMPORT_HAR,
      });
    }
  } else {
    sendFromProxyViewToRenderer({
      data: {
        canceledAction: true,
      },
      type: IMPORT_HAR,
    });
  }
};
