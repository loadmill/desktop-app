import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/to-main-process/renderer-to-main';
import { ApiForStartupWindow } from '../../types/api';
import { StartupProgress } from '../../types/startup-progress';
import { DESKTOP_API, STARTUP_PROGRESS } from '../../universal/constants';
import { subscribeToStartupWindowMessages } from '../renderer-events';

export const WINDOW_API: ApiForStartupWindow = {
  [STARTUP_PROGRESS]: (startupProgress: StartupProgress) => sendToMain(STARTUP_PROGRESS, { startupProgress }),
};

subscribeToStartupWindowMessages(STARTUP_PROGRESS, (_event, data) => {
  window.postMessage({ data, type: STARTUP_PROGRESS });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
