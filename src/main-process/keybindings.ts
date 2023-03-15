import { app, globalShortcut } from 'electron';

import { sendToRenderer } from '../inter-process-communication/main-to-renderer';
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
});

const registerAllKeyBindings = () => {
  registerEscapeKeyBind();
  registerFindKeyBind();
};

const registerEscapeKeyBind = () => {
  registerKeyBind(ACCLERATOR.ESCAPE, () => {
    sendToRenderer({
      data: { shouldShowFind: false },
      type: SHOW_FIND_ON_PAGE,
    });
  });
};

const registerFindKeyBind = () => {
  registerKeyBind(ACCLERATOR.FIND, () => {
    sendToRenderer({
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

app.on('will-quit', () => {
  for (const accelerator of Object.values(ACCLERATOR)) {
    globalShortcut.unregister(accelerator);
  }

  globalShortcut.unregisterAll();
});
