import {
  sendFromProxyViewToRenderer,
} from '../../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../../log';
import { LoadmillRequest } from '../../../types/loadmill-types';
import { ProxyEntry } from '../../../types/proxy-entry';
import { ANALYZE_REQUESTS, ANALYZE_REQUESTS_COMPLETE, UPDATED_ENTRIES } from '../../../universal/constants';
import { subscribeToMainProcessMessage } from '../../main-events';
import { getEntries, iterateEntries } from '../entries';
import { assignRequestDescription } from '../request-description';

import { entriesToHarString } from './entries-to-har-string';
import { handleNotSignedInError } from './error';
import { getTransformResult, isTransformResult, transform, TransformStatus } from './transform';

export const subscribeToAnalyzeRequests = (): void => {
  subscribeToMainProcessMessage(ANALYZE_REQUESTS, onAnalyzeRequests);
};

const onAnalyzeRequests = async (): Promise<void> => {
  try {
    const harAsString = entriesToHarString();
    const token = await transform(harAsString, 'api/orca/analyze-requests', {
      options: {
        filterIrrelevantRequests: true,
        keepAllMimeTypes: true,
      },
    });
    await pollTransformStatus(token);
  } catch (err) {
    log.error('Error analyzing requests', err);
    handleNotSignedInError(err, ANALYZE_REQUESTS_COMPLETE);
  }
};

const pollTransformStatus = async (token: string): Promise<void> => {
  log.info('Polling transform status');
  const POLLING_INTERVAL_MS = 2000;
  const MAX_POLLING_ATTEMPTS = 100;
  let pollingAttempts = 0;

  const intervalId = setInterval(async () => {
    if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
      clearInterval(intervalId);
      sendFromProxyViewToRenderer({
        data: { error: 'Analyze took too long' },
        type: ANALYZE_REQUESTS_COMPLETE,
      });
      return;
    }

    const { details, status } = await getTransformResult(token);

    if (status === TransformStatus.IN_PROGRESS) {
      pollingAttempts++;
      return;
    }

    let data;
    if (status === TransformStatus.ERROR) {
      data = { error: 'Analyze failed: ' + details };
    } else { // status === TransformStatus.SUCCESS
      if (isTransformResult(details)) {
        const requests = details.conf.requests;
        const entries = getEntries();
        prepareEntries(entries, requests);
        sendFromProxyViewToRenderer({
          data: { proxies: getEntries() },
          type: UPDATED_ENTRIES,
        });
      }
    }
    clearInterval(intervalId);
    sendFromProxyViewToRenderer({
      data,
      type: ANALYZE_REQUESTS_COMPLETE,
    });
  }, POLLING_INTERVAL_MS);
};

const prepareEntries = (entries: ProxyEntry[], requests: LoadmillRequest[]): void => {
  iterateEntries(entries, entry => prepareEntry(entry, requests));
};

const prepareEntry = (entry: ProxyEntry, requests: LoadmillRequest[]): void => {
  markIrrelevantRequest(entry, requests);
  assignRequestDescription(entry, requests);
};

const markIrrelevantRequest = (entry: ProxyEntry, requests: LoadmillRequest[]): void => {
  if (shouldMarkEntryAsIrrelevant(entry, requests)) {
    entry.irrelevant = true;
  }
};

const shouldMarkEntryAsIrrelevant = (entry: ProxyEntry, requests: LoadmillRequest[]): boolean => {
  const request = requests.find(request => request.id === entry.id);
  return !request || request.irrelevant;
};
