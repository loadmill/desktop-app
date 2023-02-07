import { randomUUID } from 'crypto';
import fs from 'fs';

import { app, ipcMain, shell } from 'electron';

import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { proxyEntriesToHar } from '../../proxy-to-har/proxy-to-har';
import { EXPORT_AS_HAR, EXPORTED_AS_HAR_SUCCESS } from '../../universal/constants';
import { toPrettyJsonString } from '../../universal/utils';

import { getEntries } from './entries';

export const subscribeToExportAsHar = (): void => {
  ipcMain.on(EXPORT_AS_HAR, exportAsHar);
};

const exportAsHar = (_event: Electron.IpcMainEvent): void => {
  const fileName = `loadmill-desktop-proxy-${randomUUID()}.har`;
  const savePath = app.getPath('downloads') + `/${fileName}`;
  log.info('savePath', savePath);
  const harToSave = proxyEntriesToHar(getEntries());

  fs.writeFile(savePath, toPrettyJsonString(harToSave), (err: NodeJS.ErrnoException) => {
    if (err) {
      log.error('Error while saving file', err);
    }
    log.info('Har exported successfully', fileName);
    sendFromProxyToRenderer({ type: EXPORTED_AS_HAR_SUCCESS });
    shell.showItemInFolder(savePath);
  });
};
