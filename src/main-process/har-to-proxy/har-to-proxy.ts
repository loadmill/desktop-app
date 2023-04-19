import log from '../../log';
import { Har } from '../../types/har';
import { ProxyEntry } from '../../types/proxy-entry';

import { HarEntryToProxyEntry } from './har-entry-to-proxy-entry';

export const harToProxyEntries = (har: Har): ProxyEntry[] => {
  try {
    return har.log.entries.map(HarEntryToProxyEntry);
  } catch (error) {
    log.error('There was an error converting the HAR to proxy entries', error);
    return [];
  }
};
