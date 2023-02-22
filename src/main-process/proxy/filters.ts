import { ProxyEntry } from '../../types/proxy-entry';
import { FILTER_REGEX } from '../../universal/constants';
import { get, set } from '../store';

let filter = '';

export const getFilterRegex = (): string => filter;

export const initFilterRegex = (): void => {
  filter = get(FILTER_REGEX) || '';
};

export const setFilterRegex = (filterRegex: string): void => {
  filter = filterRegex || '';
  set(FILTER_REGEX, filterRegex || '');
};

export const filterEntries = (entries: ProxyEntry[]): ProxyEntry[] => {
  const regex = new RegExp(filter);
  const entriesToKeep = entries.filter((entry) => {
    return regex.test(entry.request.url);
  });
  return entriesToKeep;
};

export const shouldSendEntry = (url: string): boolean =>
  new RegExp(filter).test(url);
