
import { randomUUID } from 'crypto';

import FormData from 'form-data';
import fetch from 'node-fetch';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { proxyEntriesToHar } from '../../proxy-to-har/proxy-to-har';
import { MainMessage } from '../../types/messaging';
import { CREATE_TEST, CREATE_TEST_COMPLETE } from '../../universal/constants';
import { callLoadmillApi } from '../call-loadmill-api';
import { subscribeToMainProcessMessage } from '../main-events';

import { getEntries } from './entries';

export const subscribeToCreateTest = (): void => {
  subscribeToMainProcessMessage(CREATE_TEST, onCreateTest);
};

const onCreateTest = async (_event: Electron.IpcMainEvent, { suiteId }: MainMessage['data']): Promise<void> => {
  const entries = getEntries();
  if (!suiteId) {
    suiteId = await createTestSuite();
  }
  const har = proxyEntriesToHar(entries);
  const harAsString = JSON.stringify(har);
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
        data = { createTestResult: { error: 'Error getting import status' } };
      } else if (typeof status !== 'string' && status.err) {
        data = { createTestResult: { error: status.err } };
      } else if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
        data = { createTestResult: { error: 'Import timed out' } };
      } // else status === 'done'
      sendFromProxyToRenderer({
        data,
        type: CREATE_TEST_COMPLETE,
      });
      clearInterval(intervalId);
    }
  }, POLLING_INTERVAL_MS);
};

const getImportStatus = async (token: string): Promise<'inprogress' | 'done' | { err: string } | null> => {
  try {
    const res = await callLoadmillApi(`api/orca/import-status?token=${token}`, {
      method: 'GET',
    });
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    const { status } = await res.json() as { status: 'done' | 'inprogress' };
    return status;
  } catch (err) {
    log.info('Error getting import status', err);
    return { err };
  }
};

const importHar = async (har: string, suiteId: string): Promise<string> => {
  const policy = await getUploadPolicy();
  const key = await uploadToS3(har, policy);
  const token = await sendHarToLoadmill(key, suiteId);
  return token;
};

const getUploadPolicy = async (): Promise<S3UploadPolicy> => {
  const res = await callLoadmillApi('api/orca/upload-policy', {
    method: 'GET',
  });
  const policy = await res.json();
  return policy as S3UploadPolicy;
};

async function uploadToS3(har: string, { data, key, url }: S3UploadPolicy): Promise<string> {
  await fetch(url, {
    body: toForm(har, data),
    method: 'POST',
  });

  return key;
}

const toForm = (har: string, data: S3UploadPolicyData): FormData => {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    form.append(key, value);
  }
  form.append('file', har);
  return form;
};

type S3UploadPolicy = {
  data: S3UploadPolicyData;
  key: string;
  url: string;
};

type S3UploadPolicyData = {
  AWSAccessKeyId: string;
  'Content-Type': string;
  acl: string;
  key: string;
  policy: string;
  signature: string;
};

const createTestSuite = async (): Promise<string> => {
  const res = await callLoadmillApi('api/test-suites', {
    method: 'POST',
  });
  const { testSuiteId } = await res.json() as { testSuiteId: string };
  return testSuiteId;
};

const sendHarToLoadmill = async (key: string, suiteId: string): Promise<string> => {
  const channel = randomUUID();
  const res = await callLoadmillApi(`api/test-suites/${suiteId}/import`, {
    body: JSON.stringify({
      channel,
      key,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const { token } = await res.json() as { token: string };
  log.info(`sent HAR to Loadmill. Got token: ${token}`);
  return token;
};
