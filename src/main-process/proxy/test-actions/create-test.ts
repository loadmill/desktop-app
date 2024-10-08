import dayjs from 'dayjs';

import {
  sendFromProxyViewToRenderer,
} from '../../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../../log';
import { MainMessage } from '../../../types/messaging';
import { CREATE_TEST, CREATE_TEST_COMPLETE } from '../../../universal/constants';
import { callLoadmillApi } from '../../call-loadmill-api';
import { subscribeToMainProcessMessage } from '../../main-events';

import { entriesToHarString } from './entries-to-har-string';
import { handleNotSignedInError } from './error';
import { getImportStatus, importHar } from './import-har';

export const subscribeToCreateTest = (): void => {
  subscribeToMainProcessMessage(CREATE_TEST, onCreateTest);
};

const onCreateTest = async (_event: Electron.IpcMainEvent, { suite }: MainMessage['data']): Promise<void> => {
  try {
    let suiteId = suite?.id;
    if (!suiteId) {
      suiteId = await createTestSuite(suite?.description);
    }
    const harAsString = entriesToHarString({ onlyRelevant: true });
    const token = await importHar(harAsString, suiteId);
    await pollImportStatus(token);
  } catch (err) {
    log.error('Error creating test', err);
    handleNotSignedInError(err, CREATE_TEST_COMPLETE);
  }
};

const pollImportStatus = async (token: string): Promise<void> => {
  log.info('Polling import status');
  const POLLING_INTERVAL_MS = 2000;
  const MAX_POLLING_ATTEMPTS = 100;
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
      sendFromProxyViewToRenderer({
        data,
        type: CREATE_TEST_COMPLETE,
      });
      clearInterval(intervalId);
    }
  }, POLLING_INTERVAL_MS);
};

const createTestSuite = async (
  description: string = getTestSuiteDescription(),
): Promise<string> => {
  const res = await callLoadmillApi('api/test-suites', {
    body: JSON.stringify({ meta: { description } }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const { testSuiteId } = await res.json() as { testSuiteId: string };
  return testSuiteId;
};

const getTestSuiteDescription = () => 'Composed Test Suite - ' + dayjs().format('MMM DD');
