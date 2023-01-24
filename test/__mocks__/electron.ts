import { getPackageVersion } from '../helpers/get-package-version';

export const app = {
  getVersion: jest.fn(() => getPackageVersion())
};
