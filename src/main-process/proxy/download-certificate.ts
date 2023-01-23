import fs from 'fs';

import { app, ipcMain, shell } from 'electron';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { DOWNLOAD_CERTIFICATE, DOWNLOADED_CERTIFICATE_SUCCESS } from '../../universal/constants';

export const subscribeToDownloadCertificate = (): void => {
  ipcMain.on(DOWNLOAD_CERTIFICATE, (_event) => {
    downloadCertificate();
  });
};

const downloadCertificate = (): void => {
  const pathToCertificateFile = process.cwd() + '/public/certs/ca.pem';
  log.info('pathToCertificateFile', pathToCertificateFile);
  const savePath = app.getPath('downloads') + '/ca.pem';
  log.info('savePath', savePath);
  const fileData = fs.readFileSync(pathToCertificateFile);

  fs.writeFile(savePath, fileData, (err: NodeJS.ErrnoException) => {
    if (err) {
      log.error('Error while saving file', err);
    }
    log.info('The file has been saved!');
    sendFromProxyToRenderer({ type: DOWNLOADED_CERTIFICATE_SUCCESS });
    shell.showItemInFolder(savePath);
  });
};
