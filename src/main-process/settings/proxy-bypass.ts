import escapeRegExp from 'lodash/escapeRegExp';

import { ProxySettings } from '../../types/settings';

export const shouldProxy = (url: string, proxySettings: ProxySettings): boolean => {
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

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    // Invalid URL, don't proxy
    return false;
  }

  const patterns = bypassList.split(/[;,]/).map(p => p.trim()).filter(p => p);

  for (const pattern of patterns) {
    if (!pattern) {
      continue;
    }

    const regexPattern = '^' + pattern.split('*').map(escapeRegExp).join('.*') + '$';
    const regex = new RegExp(regexPattern);

    if (regex.test(hostname)) {
      return false;
    }
  }

  return true;
};
