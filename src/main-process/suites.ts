import {
  sendFromProxyViewToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { MainMessage } from '../types/messaging';
import { TestSuite } from '../types/suite';
import { FETCH_SUITES, UPDATED_SUITES } from '../universal/constants';

import { callLoadmillApi } from './call-loadmill-api';
import { subscribeToMainProcessMessage } from './main-events';

export const fetchSuites = async (search: string = ''): Promise<TestSuite[]> => {
  try {
    const response = await callLoadmillApi(`api/test-suites?page=0&search=${search}`);
    if (response.status === 401) {
      throw new Error('Unauthorized 401');
    }
    const { testSuites } = await response.json() as SuitesPage;
    return testSuites;
  } catch (error) {
    log.error('Error fetching suites, reason:', error);
  }
  return [];
};

type SuitesPage = {
  from: number;
  testSuites: TestSuite[];
  total: number;
};

export const subscribeToFetchSuites = (): void => {
  subscribeToMainProcessMessage(FETCH_SUITES, onFetchSuites);
};

const onFetchSuites = async (_event: Electron.IpcMainEvent, { search }: MainMessage['data']) => {
  const suites = await fetchSuites(search);
  sendFromProxyViewToRenderer({
    data: { search, suites },
    type: UPDATED_SUITES,
  });
};
