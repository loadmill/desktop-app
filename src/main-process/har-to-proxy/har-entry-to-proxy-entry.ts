import { randomUUID } from 'crypto';

import { HarEntry } from '../../types/har';
import { ProxyEntry } from '../../types/proxy-entry';

import { toTimestamp } from './timestamp';

export const HarEntryToProxyEntry = (entry: HarEntry): ProxyEntry => {
  return {
    id: randomUUID(),
    request: {
      body: entry.request.postData,
      headers: entry.request.headers,
      method: entry.request.method,
      url: entry.request.url,
    },
    response: {
      body: entry.response.content,
      headers: entry.response.headers,
      status: entry.response.status,
    },
    timestamp: toTimestamp(entry.startedDateTime),
  };
};
