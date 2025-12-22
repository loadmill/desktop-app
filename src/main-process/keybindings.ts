import { app, globalShortcut } from 'electron';

import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { SHOW_FIND_ON_PAGE } from '../universal/constants';

import { getMainWindow } from './main-window';

enum ACCLERATOR {
  ESCAPE = 'Escape',
  FIND = 'CommandOrControl+F',
}

app.whenReady().then(() => {
  app.on('browser-window-focus', () => {
    registerAllKeyBindings();
    log.info('Registered Cmd+F (find) keybinding on window focus');
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregisterAll();
    log.info('Unregistered all keybindings on window blur');
  });

  app.on('will-quit', () => {
    for (const accelerator of Object.values(ACCLERATOR)) {
      globalShortcut.unregister(accelerator);
    }
    globalShortcut.unregisterAll();
    log.info('Unregistered all keybindings on app quit');
  });
});

const registerAllKeyBindings = () => {
  registerEscapeKeyBind();
  registerFindKeyBind();
};

const registerEscapeKeyBind = () => {
  registerKeyBind(ACCLERATOR.ESCAPE, () => {
    getMainWindow()?.webContents.sendInputEvent({ keyCode: 'Escape', type: 'keyDown' });
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
  logRegistration(isSuccessful, accelerator);
};

const unregisterKeyBind = (
  accelerator: Electron.Accelerator,
) => {
  globalShortcut.unregister(accelerator);
  log.info(accelerator + ' unregistered successfully');
};

const logRegistration = (
  isSuccessful: boolean,
  accelerator: Electron.Accelerator,
) => {
  if (!isSuccessful) {
    log.info(accelerator + ' registration failed');
  } else {
    log.info(accelerator + ' registered successfully');
  }
};

const onCodeMirrorFocusStateChanged = (
  _event: Electron.IpcMainEvent,
  { isFocused }: { isFocused: boolean }) => {
  log.info('CodeMirror focus state changed', { isFocused });
  if (isFocused) {
    unregisterKeyBind(ACCLERATOR.FIND);
    unregisterKeyBind(ACCLERATOR.ESCAPE);
  } else {
    registerFindKeyBind();
    registerEscapeKeyBind();
  }
};
