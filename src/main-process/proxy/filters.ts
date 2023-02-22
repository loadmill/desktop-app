import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import { MainMessage } from '../../types/messaging';
import { ProxyEntry } from '../../types/proxy-entry';
import { FILTER_REGEX, INIT_FILTER_REGEX, SET_FILTER_REGEX, UPDATED_ENTRIES } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
import { get, set } from '../store';

import { getEntries } from './entries';

let filter = '';

export const subscribeToFilterRegexEvents = (): void => {
  filter = get(FILTER_REGEX) || '';
  subscribeToInitFilterRegexFromRenderer();
  subscribeToSetFilterRegexFromRenderer();
};

const subscribeToInitFilterRegexFromRenderer = (): void => {
  subscribeToMainProcessMessage(INIT_FILTER_REGEX, () => {
    sendFromProxyToRenderer({
      data: {
        filterRegex: filter,
      },
      type: INIT_FILTER_REGEX,
    });
  });
};

const subscribeToSetFilterRegexFromRenderer = (): void => {
  subscribeToMainProcessMessage(SET_FILTER_REGEX, (_event, { filterRegex }: MainMessage['data']) => {

    setFilterRegex(filterRegex);

    sendFromProxyToRenderer({
      data: {
        proxies: filterEntries(getEntries()),
      },
      type: UPDATED_ENTRIES,
    });
  });
};

const setFilterRegex = (filterRegex: string): void => {
  filter = filterRegex || '';
  set(FILTER_REGEX, filterRegex || '');
};

const filterEntries = (entries: ProxyEntry[]): ProxyEntry[] => {
  const regex = new RegExp(filter);
  const entriesToKeep = entries.filter((entry) => {
    return regex.test(entry.request.url);
  });
  return entriesToKeep;
};

export const shouldSendEntry = (url: string): boolean =>
  new RegExp(filter).test(url);
