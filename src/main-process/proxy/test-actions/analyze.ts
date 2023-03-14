import { sendFromProxyToRenderer } from '../../../inter-process-communication/proxy-to-render';
import log from '../../../log';
import { ProxyEntry } from '../../../types/proxy-entry';
import { ANALYZE_REQUESTS, ANALYZE_REQUESTS_COMPLETE, UPDATED_ENTRIES } from '../../../universal/constants';
import { subscribeToMainProcessMessage } from '../../main-events';
import { getEntries } from '../entries';

import { entriesToHarString } from './entries-to-string';
import { getTransformResult, isTransformResult, LoadmillRequest, transform, TransformStatus } from './transform';

export const subscribeToAnalyzeRequests = (): void => {
  subscribeToMainProcessMessage(ANALYZE_REQUESTS, onAnalyzeRequests);
};

const onAnalyzeRequests = async (): Promise<void> => {
  const harAsString = entriesToHarString();
  const token = await transform(harAsString, 'api/orca/transform');
  await pollTransformStatus(token);
};

const pollTransformStatus = async (token: string): Promise<void> => {
  log.info('Polling transform status');
  const POLLING_INTERVAL_MS = 2000;
  const MAX_POLLING_ATTEMPTS = 20;
  let pollingAttempts = 0;

  const intervalId = setInterval(async () => {
    if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
      clearInterval(intervalId);
      sendFromProxyToRenderer({
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
        if (requests.length === entries.length) {
          markIrrelevantRequests(entries, requests);
          sendFromProxyToRenderer({
            data: { proxies: getEntries() },
            type: UPDATED_ENTRIES,
          });
        } else {
          log.error('Number of proxy entries and conf requests do not match', { entries, requests });
          data = { error: 'Analyze failed' };
        }
      }
    }
    clearInterval(intervalId);
    sendFromProxyToRenderer({
      data,
      type: ANALYZE_REQUESTS_COMPLETE,
    });
  }, POLLING_INTERVAL_MS);
};

const markIrrelevantRequests = (entries: ProxyEntry[], requests: LoadmillRequest[]): void => {
  entries.forEach((entry, index) => {
    const request = requests[index];
    if (isIrrelevantRequest(request)) {
      entry.irrelevant = true;
    }
  });
};

const isIrrelevantRequest = (request: LoadmillRequest): boolean => {
  return request.method === 'GET' && (!request.extract || request.extract.length === 0);
};
