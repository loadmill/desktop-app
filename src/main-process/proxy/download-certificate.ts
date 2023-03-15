import fs from 'fs';

import { shell } from 'electron';

import {
  sendFromProxyToRenderer
} from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import {
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS
} from '../../universal/constants';
import {
  PROXY_CERTIFICATE_PATH,
  PROXY_CERTIFICATE_SAVE_PATH,
} from '../constants';
import { subscribeToMainProcessMessage } from '../main-events';

export const subscribeToDownloadCertificate = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_CERTIFICATE, downloadCertificate);
};

const downloadCertificate = (): void => {
  const savePath = PROXY_CERTIFICATE_SAVE_PATH;
  log.info('savePath', savePath);
  const fileData = fs.readFileSync(PROXY_CERTIFICATE_PATH);

  fs.writeFile(savePath, fileData, (err: NodeJS.ErrnoException) => {
    if (err) {
      log.error('Error while saving file', err);
    }
    log.info('The file has been saved!');
    sendFromProxyToRenderer({ type: DOWNLOADED_CERTIFICATE_SUCCESS });
    shell.showItemInFolder(savePath);
  });
};
