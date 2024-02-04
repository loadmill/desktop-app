import { LoadmillRequest } from '../../types/loadmill-types';
import { ProxyEntry } from '../../types/proxy-entry';

import { iterateEntries } from './entries';

export const assignRequestDescription = (entry: ProxyEntry, requests: LoadmillRequest[]): void => {
  const request = requests.find(request => request.id === entry.id);
  if (request) {
    entry.request.description = request.description || getDefaultRequestDescription(entry.request);
  }
};

export const setRequestDescriptions = (entries: ProxyEntry[]): void => {
  iterateEntries(entries, (entry: ProxyEntry) => setRequestDescription(entry.request));
};

export const setRequestDescription = (request: ProxyEntry['request']): void => {
  const { description } = request;
  if (!description) {
    request.description = getDefaultRequestDescription(request);
  }
};

const getDefaultRequestDescription = (request: ProxyEntry['request']): string => {
  const { method, url } = request;
  return `${method} ${getPathname(url)}`;
};

const getPathname = (url: string): string => {
  const { pathname } = new URL(url);
  return pathname;
};
