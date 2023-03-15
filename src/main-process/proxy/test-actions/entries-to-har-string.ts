import { proxyEntriesToHar } from '../../../proxy-to-har/proxy-to-har';
import { getEntries, GetEntriesOptions } from '../entries';

export const entriesToHarString = ({ onlyRelevant = false }: GetEntriesOptions = {}): string => {
  const entries = getEntries({ onlyRelevant });
  const har = proxyEntriesToHar(entries);
  const harAsString = JSON.stringify(har);
  return harAsString;
};
