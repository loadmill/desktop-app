import { importJSONResource } from './file-to-object';

export const getPackageVersion = (): string => {
  return importJSONResource<{ version: string; }>('../../package.json').version;
};
