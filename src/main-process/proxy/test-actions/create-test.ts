import { sendFromProxyToRenderer } from '../../../inter-process-communication/proxy-to-render';
import log from '../../../log';
import { MainMessage } from '../../../types/messaging';
import { CREATE_TEST, CREATE_TEST_COMPLETE } from '../../../universal/constants';
import { callLoadmillApi } from '../../call-loadmill-api';
import { subscribeToMainProcessMessage } from '../../main-events';

import { entriesToHarString } from './entries-to-har-string';
import { getImportStatus, importHar } from './import-har';

export const subscribeToCreateTest = (): void => {
  subscribeToMainProcessMessage(CREATE_TEST, onCreateTest);
};

const onCreateTest = async (_event: Electron.IpcMainEvent, { suiteId }: MainMessage['data']): Promise<void> => {
  if (!suiteId) {
    suiteId = await createTestSuite();
  }
  const harAsString = entriesToHarString({ onlyRelevant: true });
  const token = await importHar(harAsString, suiteId);
  await pollImportStatus(token);
};

const pollImportStatus = async (token: string): Promise<void> => {
  log.info('Polling import status');
  const POLLING_INTERVAL_MS = 2000;
  const MAX_POLLING_ATTEMPTS = 10;
  let pollingAttempts = 0;

  const intervalId = setInterval(async () => {
    const status = await getImportStatus(token);
    log.info('Import status =', status);
    if (status === 'inprogress') {
      pollingAttempts++;
    } else {
      let data;
      if (!status) {
        data = { error: 'Error getting import status' };
      } else if (typeof status !== 'string' && status.err) {
        data = { error: status.err };
      } else if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
        data = { error: 'Import timed out' };
      } // else status === 'done'
      sendFromProxyToRenderer({
        data,
        type: CREATE_TEST_COMPLETE,
      });
      clearInterval(intervalId);
    }
  }, POLLING_INTERVAL_MS);
};

const createTestSuite = async (): Promise<string> => {
  const res = await callLoadmillApi('api/test-suites', {
    method: 'POST',
  });
  const { testSuiteId } = await res.json() as { testSuiteId: string };
  return testSuiteId;
};
