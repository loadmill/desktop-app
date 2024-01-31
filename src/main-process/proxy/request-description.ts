import { ProxyEntry } from '../../types/proxy-entry';

import { LoadmillRequest } from './test-actions/transform';

export const assignRequestDescriptions = (entries: ProxyEntry[], requests: LoadmillRequest[]): void => {
  entries.forEach(entry => assignRequestDescription(entry, requests));
};

const assignRequestDescription = (entry: ProxyEntry, requests: LoadmillRequest[]): void => {
  const request = requests.find(request => request.id === entry.id);
  if (request) {
    entry.request.description = request.description;
  }
};

export const setRequestDescriptions = (entries: ProxyEntry[]): void => {
  entries.forEach(({ request }) => setRequestDescription(request));
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
