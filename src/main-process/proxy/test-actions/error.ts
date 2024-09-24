import {
  sendFromProxyViewToRenderer,
} from '../../../inter-process-communication/to-renderer-process/main-to-renderer';
import { ProxyRendererMessageTypes } from '../../../types/messaging';

export type ErrorResult<T = string> = {
  err: T;
};

export const isErrorResult = (res: unknown): res is ErrorResult => {
  return res && typeof (res as ErrorResult).err === 'string';
};

export const handleNotSignedInError = (err: Error, msgType: ProxyRendererMessageTypes): void => {
  let dataError = '';
  dataError = err.message === 'No cookie' ?
    'You are not logged in to Loadmill' :
    err.message;

  sendFromProxyViewToRenderer({
    data: { error: dataError },
    type: msgType,
  });
};
