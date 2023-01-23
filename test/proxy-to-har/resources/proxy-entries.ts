import { Har, HarEntry } from '../../../src/types/har';
import { ProxyEntry } from '../../../src/types/proxy-entry';
import { importJSONResource } from '../../helpers/file-to-object';

export const proxyEntry: ProxyEntry = {
  id: '5f9f1b9b-9c9c-4b9c-9b9b-9c9c9b9c9b9c',
  request: {
    body: {
      mimeType: 'text/plain',
      text: 'Hello, World!'
    },
    headers: [
      { name: 'User-Agent', value: 'curl/7.64.1' },
      { name: 'Accept', value: '*/*' }
    ],
    method: 'GET',
    url: 'https://example.com?foo=bar&baz=qux&baz=quux&corge=',
  },
  response: {
    body: {
      mimeType: 'text/plain',
      text: 'Hello, World!'
    },
    headers: [
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'Content-Length', value: '13' }
    ],
    status: 200,
    statusText: 'OK',
  },
  timestamp: 1590000000000,
};

export const harEntry: HarEntry = {
  request: {
    headers: [
      { name: 'User-Agent', value: 'curl/7.64.1' },
      { name: 'Accept', value: '*/*' }
    ],
    method: 'GET',
    queryString: [{ name: 'foo', value: 'bar' }, { name: 'baz', value: 'qux' }, { name: 'baz', value: 'quux' }, { name: 'corge', value: '' }],
    url: 'https://example.com?foo=bar&baz=qux&baz=quux&corge=',
  },
  response: {
    content: {
      mimeType: 'text/plain',
      text: 'Hello, World!',
    },
    headers: [
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'Content-Length', value: '13' }
    ],
    status: 200,
  },
  startedDateTime: '2020-05-20T18:40:00.000Z',
};

export const proxyEntries: ProxyEntry[] = [
  proxyEntry,
];

const packageVersion = importJSONResource<{ version: string; }>('../../package.json').version;

export const harLog: Har = {
  log: {
    creator: {
      name: 'loadmill-desktop-proxy',
      version: packageVersion,
    },
    entries: [
      harEntry,
    ],
    version: '1.2',
  }
};
