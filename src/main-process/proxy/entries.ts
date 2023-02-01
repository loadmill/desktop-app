import log from '../../log';
import { ProxyEntry } from '../../types/proxy-entry';

const entries: ProxyEntry[] = [];

export const getEntries = (): ProxyEntry[] => entries;

export const initEntries = (newEntries: ProxyEntry[]): void => {
  entries.push(...newEntries);
};

export const addEntry = (entry: ProxyEntry): void => {
  entries.push(entry);
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
