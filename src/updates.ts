import { app, autoUpdater, dialog, ipcMain } from 'electron';

import { CHECK_FOR_UPDATES, UPDATE_DOWNLOADED, UPDATE_NOT_AVAILABLE } from './constants';
import log from './log';

let shouldShowUpToDatePopup = false;

export const checkForUpdates = (): void => {
  log.info('User request: Check for updates...');
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
};

ipcMain.on(CHECK_FOR_UPDATES, (_event) => {
  shouldShowUpToDatePopup = true;
  checkForUpdates();
});

const showUpdateAndRestartDialog = (
  event: Electron.Event,
  releaseNotes: string,
  releaseName: string,
  releaseDate: Date,
  updateURL: string
): void => {
  log.info(UPDATE_DOWNLOADED, { event, releaseDate, releaseName, releaseNotes, updateURL });

  const newVersionMsg = 'New Version: ' + releaseName;

  const restartDialogOpts: Electron.MessageBoxOptions = {
    buttons: ['Restart'],
    detail: 'A new version has been downloaded. Please restart the application to apply the updates.',
    message: process.platform === 'win32' ? releaseNotes : newVersionMsg,
    title: 'Application Update',
    type: 'info',
  };

  dialog.showMessageBox(restartDialogOpts)
    .then(({ response }: Electron.MessageBoxReturnValue) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
};

export const overrideOnUpdateDownloadedListener = (): void => {
  if (app.isPackaged) {
    autoUpdater.on(UPDATE_DOWNLOADED, showUpdateAndRestartDialog);
  }
};

const showNoUpdatesDialog = async (): Promise<void> => {
  if (shouldShowUpToDatePopup) {
    log.info(UPDATE_NOT_AVAILABLE);

    const noUpdatesDialogOpts: Electron.MessageBoxOptions = {
      buttons: ['OK'],
      detail: 'You’ve got the latest version of Loadmill Desktop Agent',
      message: 'Your agent is up to date',
      type: 'info',
    };

    await dialog.showMessageBox(noUpdatesDialogOpts);
    shouldShowUpToDatePopup = false;
  }
};

export const overrideOnUpdateNotAvailableListener = (): void => {
  if (app.isPackaged) {
    autoUpdater.on(UPDATE_NOT_AVAILABLE, showNoUpdatesDialog);
  }
};
