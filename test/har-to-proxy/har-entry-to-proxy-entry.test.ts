import { HarEntryToProxyEntry } from '../../src/main-process/har-to-proxy/har-entry-to-proxy-entry';
import { ProxyEntry } from '../../src/types/proxy-entry';
import { harEntry } from '../proxy-to-har/resources/proxy-entries';

describe('HarEntryToProxyEntry', () => {
  let proxyEntry: ProxyEntry;

  beforeAll(() => {
    proxyEntry = HarEntryToProxyEntry(harEntry);
  });

  test('Expect to have a UUID', () => {
    expect(proxyEntry.id).toHaveLength(36); // UUID v4
  });

  test('Expect to have same request properties as Har.Entry', () => {
    expect(proxyEntry.request.body).toEqual(harEntry.request.postData);
    expect(proxyEntry.request.headers).toEqual(harEntry.request.headers);
    expect(proxyEntry.request.method).toBe(harEntry.request.method);
    expect(proxyEntry.request.url).toBe(harEntry.request.url);
  });

  test('Expect to have same response properties as Har.Entry', () => {
    expect(proxyEntry.response.body).toEqual(harEntry.response.content);
    expect(proxyEntry.response.headers).toEqual(harEntry.response.headers);
    expect(proxyEntry.response.status).toBe(harEntry.response.status);
  });

  test('Expect to have same timestamp as Har.Entry', () => {
    expect(proxyEntry.timestamp).toBe(1590000000000);
  });
});
