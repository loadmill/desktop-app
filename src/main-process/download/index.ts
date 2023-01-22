import { app, BrowserWindow } from 'electron';

import log from '../../log';

export const subscribeToWillDownloadEvent = (win: BrowserWindow, fileNameToSave: string): void => {
  win.webContents.session.on('will-download', (_event: Electron.Event, item: Electron.DownloadItem) => {
    log.info('will-download file to save', { item });
    const savePath = app.getPath('downloads') + '/' + fileNameToSave;
    log.info('will-download savePath', savePath);
    item.setSavePath(savePath);

    item.on('updated', (_event, state) => {
      if (state === 'interrupted') {
        log.info('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          log.info('Download is paused');
        } else {
          log.info(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once('done', (_event, state: 'interrupted' | 'completed' | 'cancelled') => {
      if (state === 'completed') {
        log.info('Download successfully');
      } else {
        log.info(`Download failed: ${state}`);
      }
    });
  });
};
