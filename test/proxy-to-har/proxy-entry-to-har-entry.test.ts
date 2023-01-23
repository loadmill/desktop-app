import { proxyEntryToHarEntry } from '../../src/proxy-to-har/proxy-entry-to-har-entry';

import { harEntry, proxyEntry } from './resources/proxy-entries';

describe('proxyEntryToHarEntry', () => {
  test('converts a ProxyEntry to a Har.Entry', () => {
    expect(proxyEntryToHarEntry(proxyEntry)).toEqual(harEntry);
  });
});
