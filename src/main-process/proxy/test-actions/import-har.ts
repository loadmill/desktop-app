import log from '../../../log';
import { callLoadmillApi } from '../../call-loadmill-api';

import { uploadToS3 } from './s3';
import { getTransformToken } from './transform';

export const importHar = async (har: string, suiteId: string): Promise<string> => {
  const key = await uploadToS3(har);
  const token = await getTransformToken(key, `api/test-suites/${suiteId}/import`, {
    keepAllMimeTypes: true,
  });
  return token;
};

export const getImportStatus = async (token: string): Promise<'inprogress' | 'done' | { err: string } | null> => {
  try {
    const res = await callLoadmillApi(`api/orca/import-status?token=${token}`, {
      method: 'GET',
    });
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    const { status } = await res.json() as { status: 'done' | 'inprogress' };
    return status;
  } catch (err) {
    log.info('Error getting import status', err);
    return { err };
  }
};
