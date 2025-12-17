import micromatch from 'micromatch';

import log from '../../log';
import { ProxySettings } from '../../types/settings';

export const shouldProxy = (url: string, proxySettings: ProxySettings): boolean => {
  try {
    if (!proxySettings?.enabled) {
      return false;
    }

    const bypassList = proxySettings.bypassPatternsList;

    if (!bypassList || bypassList.trim() === '') {
      return true; // No bypass patterns, proxy everything
    }

    if (bypassList.trim() === '*') {
      return false; // Wildcard means bypass everything
    }

    const hostname = new URL(url).hostname;

    const patterns = bypassList.split(/[;,]/).map(p => p.trim()).filter(p => p);

    if (micromatch.isMatch(hostname, patterns)) {
      return false;
    }

    return true;
  } catch (error) {
    log.warn('Error evaluating should proxy', { error, url });
    return false;
  }
};
