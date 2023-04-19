import isBase64 from 'is-base64';

export const getEncoding = (text: string): 'base64' | undefined => {
  if (isBase64(text)) {
    return 'base64';
  }
};
