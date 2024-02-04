import log from '../../log';
import { ProxyEntry } from '../../types/proxy-entry';

import { filterEntries } from './filters';
import {
  setRequestDescription,
  setRequestDescriptions,
} from './request-description';

const MAX_ENTRIES = 1000;

const entries: ProxyEntry[] = [];

export type GetEntriesOptions = {
  filter?: boolean;
  onlyRelevant?: boolean;
};

export const getEntries = ({ filter = true, onlyRelevant = false }: GetEntriesOptions = {}): ProxyEntry[] => {
  let filteredEntries = entries;
  if (filter) {
    filteredEntries = filterEntries(filteredEntries);
  }
  if (onlyRelevant) {
    filteredEntries = filteredEntries.filter(entry => !entry.irrelevant);
  }
  return filteredEntries;
};

export const appendEntries = (newEntries: ProxyEntry[]): void => {
  setRequestDescriptions(newEntries);
  entries.push(...newEntries);
};

export const addEntry = (entry: ProxyEntry): void => {
  setRequestDescription(entry.request);
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.shift();
  }
};

export const clearEntries = (): void => {
  entries.splice(0, entries.length);
};

export const deleteEntry = (id: ProxyEntry['id']): void => {
  const index = entries.findIndex(entry => entry.id === id);
  if (index !== -1) {
    entries.splice(index, 1);
  } else {
    log.error(`Could not find entry with id ${id}`);
  }
};

export const deleteEntries = (ids: ProxyEntry['id'][]): void => {
  if (ids.length === entries.length) {
    clearEntries();
    return;
  }
  ids.forEach(id => deleteEntry(id));
};

export const iterateEntries = (
  entries: ProxyEntry[],
  callback: (entry: ProxyEntry) => void,
): void => {
  entries.forEach(callback);
};
