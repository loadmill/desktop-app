import { randomUUID } from 'crypto';

import log from '../../../log';
import { callLoadmillApi } from '../../call-loadmill-api';

import { uploadToS3 } from './s3';

export const transform = async (
  har: string,
  path: string,
  options: TransformOptions = { options: {} },
): Promise<string> => {
  const key = await uploadToS3(har);
  const token = await getTransformToken(key, path, options);
  return token;
};

export const getTransformToken = async (
  key: string,
  path: string,
  restOfBody: { [key: string]: unknown } = {},
): Promise<string> => {
  const channel = randomUUID();
  const res = await callLoadmillApi(path, {
    body: JSON.stringify({
      channel,
      key,
      ...restOfBody,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const { token } = await res.json() as { token: string };
  log.info(`sent HAR to Loadmill. Got token: ${token}`);
  return token;
};

export enum TransformStatus {
  IN_PROGRESS,
  SUCCESS,
  ERROR,
}

export const getTransformResult = async (
  token: string,
): Promise<{ details?: TransformResult | string; status: TransformStatus; }> => {
  try {
    const res = await callLoadmillApi(`api/orca/transform?token=${token}`);
    log.info(`res status from api/orca/transform: ${res.status}`);
    if (res.status === 404) {
      return {
        status: TransformStatus.IN_PROGRESS,
      };
    }
    if (res.status === 401) {
      return {
        details: 'Unauthorized',
        status: TransformStatus.ERROR,
      };
    }
    if (res.status === 500) {
      return {
        details: 'Internal server error',
        status: TransformStatus.ERROR,
      };
    }
    return {
      details: await res.json() as TransformResult,
      status: TransformStatus.SUCCESS,
    };
  } catch (err) {
    log.error(`Error while trying to get transform result: ${err}`);
    return {
      details: err,
      status: TransformStatus.ERROR,
    };
  }
};

export type Extraction = { [parameter: string]: string | object };
export type LoadmillRequest = { extract: Extraction[]; id: string; irrelevant?: boolean; method: string; };
export type TransformResult = { conf: { requests: LoadmillRequest[] } };
export type TransformOptions = { options: {
  filterIrrelevantRequests?: boolean;
  keepAllMimeTypes?: boolean;
  removeIrrelevantRequests?: boolean;
} };

export const isTransformResult = (result?: unknown): result is TransformResult => {
  return !!(result as TransformResult)?.conf?.requests;
};
