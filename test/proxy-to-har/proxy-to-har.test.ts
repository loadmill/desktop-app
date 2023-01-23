import { app } from 'electron';

import { proxyEntriesToHar } from '../../src/proxy-to-har/proxy-to-har';
import { getPackageVersion } from '../helpers/get-package-version';

import { harLog, proxyEntries } from './resources/proxy-entries';

jest.mock('electron', () => ({
  app: {
    getVersion: jest.fn(),
  },
}));

(app.getVersion as jest.Mock).mockReturnValue(getPackageVersion());

describe('proxyEntriesToHar', () => {
  test('converts a ProxyEntry to a Har.Entry', () => {
    expect(proxyEntriesToHar(proxyEntries)).toEqual(harLog);
  });
});
