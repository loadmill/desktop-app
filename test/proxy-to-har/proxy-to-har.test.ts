import { proxyEntriesToHar } from '../../src/proxy-to-har/proxy-to-har';

import { harLog, proxyEntries } from './resources/proxy-entries';

describe('proxyEntriesToHar', () => {
  test('converts a ProxyEntry to a Har.Entry', () => {
    expect(proxyEntriesToHar(proxyEntries)).toEqual(harLog);
  });
});
