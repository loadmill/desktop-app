import { ProxyEntry } from '../../types/proxy-entry';

const entries: ProxyEntry[] = [];

export const getEntries = (): ProxyEntry[] => entries;

export const initEntries = (newEntries: ProxyEntry[]): void => {
  entries.push(...newEntries);
};

export const addEntry = (entry: ProxyEntry): void => {
  entries.push(entry);
};
