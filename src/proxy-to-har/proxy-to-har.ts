import { app } from 'electron';

import { Har } from '../types/har';
import { ProxyEntry } from '../types/proxy-entry';

import { proxyEntryToHarEntry } from './proxy-entry-to-har-entry';

const CREATOR_NAME = 'loadmill-desktop-proxy';
const HAR_VERSION = '1.2';

export const proxyEntriesToHar = (proxyEntries: ProxyEntry[]): Har => {
  return {
    log: {
      creator: {
        name: CREATOR_NAME,
        version: app.getVersion(),
      },
      entries: proxyEntries.map(proxyEntryToHarEntry),
      version: HAR_VERSION,
    },
  };
};
