export type ErrorResult<T = string> = {
  err: T;
};

export const isErrorResult = (res: unknown): res is ErrorResult => {
  return res && typeof (res as ErrorResult).err === 'string';
};
