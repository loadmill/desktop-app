import { BrowserWindow, ipcMain, WebContentsView } from 'electron';

import { sendFromStartupWindowToRenderer } from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { StartupProgress } from '../types/startup-progress';
import { STARTUP_PROGRESS } from '../universal/constants';

import { subscribeToMainProcessMessage } from './main-events';
import { getMainWindow } from './main-window';
import { switchView } from './views/switch-views';

let currentOrder = 0;
let firstEventTime = 0;
const startupProgressList: { name: string; timeElapsed: number }[] = [];
const startupProgressLogMap: { [key in StartupProgress]?: { count: number, order: number } } = {};

const startupProgressTargets: Array<{
  target: BrowserWindow | WebContentsView,
  type: 'startupWindow' | 'loadmillWebView',
}> = [];

export const registerStartupProgressTarget = (
  target: BrowserWindow | WebContentsView,
  type: 'startupWindow' | 'loadmillWebView',
): void => {
  startupProgressTargets.push({ target, type });
};

const startupProgressHandler = (_event: Electron.IpcMainEvent, data: { startupProgress: StartupProgress }) => {
  const { startupProgress } = data;
  _logStartupProgress(startupProgress);
  const loadmillWebAppView = startupProgressTargets.find((target) => target.type === 'loadmillWebView')?.target as WebContentsView;
  const startupWindow = startupProgressTargets.find((target) => target.type === 'startupWindow')?.target as BrowserWindow;
  _handleLoadmillWebAppView(startupProgress, loadmillWebAppView);
  _handleStartupWindow(startupProgress, startupWindow);
  if (startupProgress === 'appReady') {
    ipcMain.removeListener(STARTUP_PROGRESS, startupProgressHandler);
  }
};

subscribeToMainProcessMessage(STARTUP_PROGRESS, startupProgressHandler);

const _logStartupProgress = (startupProgress: StartupProgress) => {
  log.debug('STARTUP_PROGRESS event', { startupProgress });
  const currentEventTime = Date.now();
  if (currentOrder === 0) {
    firstEventTime = currentEventTime;
  }
  const timeSinceStart = currentEventTime - firstEventTime;
  if (!Object.prototype.hasOwnProperty.call(startupProgressLogMap, startupProgress)) {
    startupProgressLogMap[startupProgress] = { count: 1, order: currentOrder };
    currentOrder++;
  } else {
    startupProgressLogMap[startupProgress].count++;
  }
  startupProgressList.push({ name: startupProgress, timeElapsed: timeSinceStart });
  log.info({ startupProgressList, startupProgressLogMap, timeSinceStart });
};

const _handleLoadmillWebAppView = (startupProgress: StartupProgress, loadmillWebAppView: WebContentsView): void => {
  if (startupProgress === 'appReady') {
    getMainWindow?.().maximize();
    switchView(getMainWindow?.(), loadmillWebAppView);
  }
};

const _handleStartupWindow = (startupProgress: StartupProgress, startupWindow: BrowserWindow): void => {
  try {
    sendFromStartupWindowToRenderer({
      data: { startupProgress },
      type: STARTUP_PROGRESS,
    });
  } catch (error) {
    log.info('Failed to send STARTUP_PROGRESS to startup window', { error });
  }
  if (startupProgress === 'appReady') {
    setTimeout(() => {
      startupWindow.hide();
      startupWindow.close();
      startupWindow.destroy();
    }, 1000);
  }
};
