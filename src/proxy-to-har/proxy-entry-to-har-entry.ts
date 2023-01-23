import { HarEntry } from '../types/har';
import { ProxyEntry } from '../types/proxy-entry';

export const proxyEntryToHarEntry = (proxyEntry: ProxyEntry): HarEntry => {
  const request = proxyEntry.request;
  const response = proxyEntry.response;

  return {
    request: {
      headers: request.headers,
      method: request.method,
      queryString: [],
      url: request.url,
    },
    response: {
      content: {
        mimeType: response.body?.mimeType,
        size: response.body?.text?.length,
        text: response.body?.text,
      },
      headers: response.headers,
      status: response.status,
    },
    startedDateTime: new Date(proxyEntry.timestamp).toISOString(),
  };
};

// const urlPathToQueryString = (url: string): HarEntry['request']['queryString'] => {
//   const urlObject = new URL(url);
//   const searchParams = urlObject.searchParams;
//   const queryString: QueryString[] = [];
//   for (const [name, value] of searchParams) {
//     queryString.push({ name, value });
//   }
//   return queryString;
// };
