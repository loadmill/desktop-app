import log from '../log';
import { HarEntry, QueryString } from '../types/har';
import { ProxyEntry } from '../types/proxy-entry';

export const proxyEntryToHarEntry = (proxyEntry: ProxyEntry): HarEntry => {
  const request = proxyEntry.request;
  const response = proxyEntry.response;

  return {
    request: {
      headers: request.headers,
      method: request.method,
      postData: request.body,
      queryString: urlPathToQueryString(request.url),
      url: request.url,
    },
    response: {
      content: response.body,
      headers: response.headers,
      status: response.status,
    },
    startedDateTime: new Date(proxyEntry.timestamp).toISOString(),
  };
};

const urlPathToQueryString = (url: string): QueryString[] => {
  const queryString: QueryString[] = [];
  try {
    const urlObject = new URL(url);
    const searchParams = urlObject.searchParams;
    for (const [name, value] of searchParams) {
      queryString.push({ name, value });
    }
  } catch (error) {
    log.error('Error parsing url', url, error);
  }
  return queryString;
};
