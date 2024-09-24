import path from 'path';

import { shell } from 'electron';

import { DOWNLOADS_PATH } from '../../downloads/constants';
import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import {
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
} from '../../universal/constants';
import { copyFile } from '../copy-file';
import { subscribeToMainProcessMessage } from '../main-events';

import {
  PROXY_CERTIFICATES_DIR_PATH,
} from './constants';

export const proxyCertificatePath = path.join(PROXY_CERTIFICATES_DIR_PATH, 'certs', 'ca.pem');
export const proxyCertificateDownloadLocation = path.join(DOWNLOADS_PATH, 'loadmill-proxy-certificate.pem');

export const subscribeToDownloadCertificate = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_CERTIFICATE, downloadCertificate);
};

const downloadCertificate = (): void => {
  copyFile(proxyCertificatePath, proxyCertificateDownloadLocation, () => {
    sendFromProxyViewToRenderer({ type: DOWNLOADED_CERTIFICATE_SUCCESS });
    shell.showItemInFolder(proxyCertificateDownloadLocation);
  });
};
