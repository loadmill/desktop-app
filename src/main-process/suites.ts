import { sendFromProxyToRenderer } from '../inter-process-communication/proxy-to-render';
import log from '../log';
import { SuiteOption } from '../types/suite';
import { FETCH_SUITES, UPDATED_SUITES } from '../universal/constants';

import { callLoadmillApi } from './call-loadmill-api';
import { subscribeToMainProcessMessage } from './main-events';

export const fetchSuites = async (): Promise<SuiteOption[]> => {
  try {
    const response = await callLoadmillApi('api/test-suites?page=0&rowsPerPage=100');
    if (response.status === 401) {
      throw new Error('Unauthorized 401');
    }
    const { testSuites } = await response.json() as SuitesPage;
    const suiteOptions = testSuites.map(({ description, id }) => ({ description, id }));
    return suiteOptions;
  } catch (error) {
    log.error('Error fetching suites, reason:', error);
  }
  return [];
};

type SuitesPage = {
  from: number;
  testSuites: (SuiteOption & { [key: string]: unknown })[];
  total: number;
};

export const subscribeToFetchSuites = (): void => {
  subscribeToMainProcessMessage(FETCH_SUITES, async () => {
    const suites = await fetchSuites();
    sendFromProxyToRenderer({
      data: { suites },
      type: UPDATED_SUITES,
    });
  });
};
