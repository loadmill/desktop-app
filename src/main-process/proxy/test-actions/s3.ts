import FormData from 'form-data';

import log from '../../../log';
import { callLoadmillApi } from '../../call-loadmill-api';
import { fetch } from '../../fetch';

export async function uploadToS3(har: string): Promise<string> {
  const { data, key, url } = await getUploadPolicy();
  await fetch(url, {
    body: toForm(har, data),
    method: 'POST',
  });
  log.info('Uploaded HAR to S3', { key });

  return key;
}

const getUploadPolicy = async (): Promise<S3UploadPolicy> => {
  const res = await callLoadmillApi('api/orca/upload-policy', {
    method: 'GET',
  });
  const policy = await res.json();
  log.info('Got S3 upload policy', { policy });
  return policy as S3UploadPolicy;
};

const toForm = (har: string, data: S3UploadPolicyData): FormData => {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    form.append(key, value);
  }
  form.append('file', har);
  return form;
};

export type S3UploadPolicy = {
  data: S3UploadPolicyData;
  key: string;
  url: string;
};

export type S3UploadPolicyData = {
  AWSAccessKeyId: string;
  'Content-Type': string;
  acl: string;
  key: string;
  policy: string;
  signature: string;
};
