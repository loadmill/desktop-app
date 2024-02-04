import { shell } from 'electron';

import {
  sendFromProxyToRenderer,
} from '../../inter-process-communication/proxy-to-render';
import {
  DOWNLOAD_CERTIFICATE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
} from '../../universal/constants';
import {
  PROXY_CERTIFICATE_PATH,
  PROXY_CERTIFICATE_SAVE_PATH,
} from '../constants';
import { copyFile } from '../copy-file';
import { subscribeToMainProcessMessage } from '../main-events';

export const subscribeToDownloadCertificate = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_CERTIFICATE, downloadCertificate);
};

const downloadCertificate = (): void => {
  copyFile(PROXY_CERTIFICATE_PATH, PROXY_CERTIFICATE_SAVE_PATH, () => {
    sendFromProxyToRenderer({ type: DOWNLOADED_CERTIFICATE_SUCCESS });
    shell.showItemInFolder(PROXY_CERTIFICATE_SAVE_PATH);
  });
};
