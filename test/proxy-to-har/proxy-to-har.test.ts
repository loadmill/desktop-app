import { getPackageVersion } from '../helpers/get-package-version';

// import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

// const require = createRequire(import.meta.url);

jest.mock('electron', () => ({
  app: {
    getVersion: jest.fn(() => getPackageVersion()),
  },
}));

const { app } = require('electron');

// alternatively
// const { app } = (await import('electron')).default;

import { proxyEntriesToHar } from '../../src/proxy-to-har/proxy-to-har';

import { harLog, proxyEntries } from './resources/proxy-entries';

// jest.spyOn(app, 'getVersion').mockImplementation(() => getPackageVersion());

describe('proxyEntriesToHar', () => {
  test('converts a ProxyEntry to a Har.Entry', () => {
    expect(proxyEntriesToHar(proxyEntries)).toEqual(harLog);
  });
});
