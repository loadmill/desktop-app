import log from '../../log';
import { ProxyEntry } from '../../types/proxy-entry';

import { filterEntries } from './filters';

const MAX_ENTRIES = 1000;

const entries: ProxyEntry[] = [];

export const getEntries = (filter = true): ProxyEntry[] => filter ? filterEntries(entries) : entries;

export const initEntries = (newEntries: ProxyEntry[]): void => {
  entries.push(...newEntries);
};

export const addEntry = (entry: ProxyEntry): void => {
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
