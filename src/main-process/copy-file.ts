import fs from 'fs';

import log from '../log';

export const copyFile = (
  source: string,
  target: string,
  onSuccess: () => void,
): void => {
  log.info('savePath', target);
  const fileData = fs.readFileSync(source);
  fs.writeFile(target, fileData, (err: NodeJS.ErrnoException) => {
    if (err) {
      log.error('Error while saving file', err);
    }
    log.info(`The file ${source} has been saved to ${target}!`);
    onSuccess();
  });
};
