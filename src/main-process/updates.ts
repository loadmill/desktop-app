import { autoUpdater, dialog } from 'electron';

import log from '../log';
import { UPDATE_DOWNLOADED, UPDATE_NOT_AVAILABLE } from '../universal/constants';

let shouldShowUpToDatePopup = false;

export const checkForUpdates = (): void => {
  log.info('User request: Check for updates...');
  shouldShowUpToDatePopup = true;
  autoUpdater.checkForUpdates();
};

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

export const overrideOnUpdateDownloadedListener = (onUpdateDownloaded: () => void): void => {
  autoUpdater.on(UPDATE_DOWNLOADED, (...args) => {
    onUpdateDownloaded();
    showUpdateAndRestartDialog(...args);
  });
};

const showNoUpdatesDialog = async (): Promise<void> => {
  if (shouldShowUpToDatePopup) {
    log.info(UPDATE_NOT_AVAILABLE);

    const noUpdatesDialogOpts: Electron.MessageBoxOptions = {
      buttons: ['OK'],
      detail: 'You’ve got the latest version of Loadmill Desktop Agent',
      message: 'Your app is up to date',
      type: 'info',
    };

    await dialog.showMessageBox(noUpdatesDialogOpts);
    shouldShowUpToDatePopup = false;
  }
};

export const overrideOnUpdateNotAvailableListener = (): void => {
  autoUpdater.on(UPDATE_NOT_AVAILABLE, showNoUpdatesDialog);
};
