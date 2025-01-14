import { app, globalShortcut } from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { SHOW_FIND_ON_PAGE } from '../universal/constants';

enum ACCLERATOR {
  ESCAPE = 'Escape',
  FIND = 'CommandOrControl+F',
}

app.whenReady().then(() => {
  app.on('browser-window-focus', () => {
    registerAllKeyBindings();
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregisterAll();
  });

  app.on('before-quit', () => {
    for (const accelerator of Object.values(ACCLERATOR)) {
      globalShortcut.unregister(accelerator);
    }

    globalShortcut.unregisterAll();
  });
});

const registerAllKeyBindings = () => {
  registerEscapeKeyBind();
  registerFindKeyBind();
};

const registerEscapeKeyBind = () => {
  registerKeyBind(ACCLERATOR.ESCAPE, () => {
    sendFromMainWindowToRenderer({
      data: { shouldShowFind: false },
      type: SHOW_FIND_ON_PAGE,
    });
  });
};

const registerFindKeyBind = () => {
  registerKeyBind(ACCLERATOR.FIND, () => {
    sendFromMainWindowToRenderer({
      data: { shouldShowFind: true },
      type: SHOW_FIND_ON_PAGE,
    });
  });
};

const registerKeyBind = (
  accelerator: Electron.Accelerator,
  callback: () => void,
) => {
  const isSuccessful = globalShortcut.register(accelerator, callback);
  logFailedRegistration(isSuccessful, accelerator);
};

const logFailedRegistration = (
  isSuccessful: boolean,
  accelerator: Electron.Accelerator,
) => {
  if (!isSuccessful) {
    log.info(accelerator + ' registration failed');
  }
};
