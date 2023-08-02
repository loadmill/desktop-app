import { sendFromProxyToRenderer } from '../inter-process-communication/proxy-to-render';
import log from '../log';
import { MainMessage } from '../types/messaging';
import { SuiteOption } from '../types/suite';
import { FETCH_SUITES, UPDATED_SUITES } from '../universal/constants';

import { callLoadmillApi } from './call-loadmill-api';
import { subscribeToMainProcessMessage } from './main-events';

export const fetchSuites = async (search: string = ''): Promise<SuiteOption[]> => {
  try {
    const response = await callLoadmillApi(`api/test-suites?page=0&rowsPerPage=100&search=${search}`);
    if (response.status === 401) {
      throw new Error('Unauthorized 401');
    }
    const { testSuites } = await response.json() as SuitesPage;
    return toSuiteOptions(testSuites, search);
  } catch (error) {
    log.error('Error fetching suites, reason:', error);
  }
  return [];
};

const toSuiteOptions = (testSuites: TestSuite[], search: string): SuiteOption[] => {
  const suiteOptions: SuiteOption[] = testSuites.map(({ description, id }) => ({ description, id }));
  appendNewSuiteOptionIfNotExists(suiteOptions, search);
  return suiteOptions;
};

const appendNewSuiteOptionIfNotExists = (suiteOptions: SuiteOption[], search: string) => {
  const isExists = suiteOptions.some(({ description }) => description === search);
  if (search && !isExists) {
    suiteOptions.push({ description: search, id: '' });
  }
};

type SuitesPage = {
  from: number;
  testSuites: TestSuite[];
  total: number;
};

type TestSuite = SuiteOption & { [key: string]: unknown };

export const subscribeToFetchSuites = (): void => {
  subscribeToMainProcessMessage(FETCH_SUITES, onFetchSuites);
};

const onFetchSuites = async (_event: Electron.IpcMainEvent, { search }: MainMessage['data']) => {
  const suites = await fetchSuites(search);
  sendFromProxyToRenderer({
    data: { suites },
    type: UPDATED_SUITES,
  });
};
