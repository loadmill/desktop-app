import fs from 'fs';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { DOWNLOAD_CERTIFICATE, DOWNLOADED_CERTIFICATE_SUCCESS } from '../../universal/constants';
import { PROXY_CERTIFICATE_PATH } from '../constants';
import { subscribeToMainProcessMessage } from '../main-events';

export const subscribeToDownloadCertificate = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_CERTIFICATE, () => downloadCertificate());
};

const downloadCertificate = () => {
  try {
    const certFileContents = fs.readFileSync(PROXY_CERTIFICATE_PATH).toString();

    sendFromProxyToRenderer({
      data: { certFileContents },
      type: DOWNLOADED_CERTIFICATE_SUCCESS
    });
  } catch (e) {
    log.error('download failed', e);
  } finally {
  }
};
