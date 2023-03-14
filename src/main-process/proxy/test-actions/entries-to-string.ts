import { proxyEntriesToHar } from '../../../proxy-to-har/proxy-to-har';
import { getEntries } from '../entries';

export const entriesToHarString = (): string => {
  const entries = getEntries();
  const har = proxyEntriesToHar(entries);
  const harAsString = JSON.stringify(har);
  return harAsString;
};
