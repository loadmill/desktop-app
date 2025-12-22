
import { sendFromMainWindowToRenderer } from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { ViewName } from '../types/views';
import { SHOW_FIND_ON_PAGE } from '../universal/constants';

import { getMainWindow } from './main-window';
import { getViewByName, getViews } from './views';

export const setupKeybindings = (): void => {
  log.info('Setting up keybindings...');
  const mainWindow = getMainWindow();
  log.info('Got mainWindow', { mainWindow });
  const views = getViews();
  log.info('Got views', { views });
  const listenTargets = [];
  const listenTargetsLog = [];
  listenTargets.push(mainWindow);
  listenTargetsLog.push({ id: mainWindow.webContents.id, name: 'mainWindow' });
  for (const v of views) {
    listenTargets.push(v.view);
    listenTargetsLog.push({ id: v.view.webContents.id, name: v.name });
  }
  log.info('Listening to before-input-event on targets', { listenTargets: listenTargetsLog });
  for (const target of listenTargets) {
    const isLoadmillWebPage = getViewByName(ViewName.WEB_PAGE)?.webContents.id === target.webContents.id;
    _setupBeforeInputEventListener(target.webContents, isLoadmillWebPage);
  }
};

const _setupBeforeInputEventListener = (webContents: Electron.WebContents, isLoadmillWebPage?: boolean) => {
  log.info('Setting up before-input-event listener for target', { id: webContents.id });
  webContents.on('before-input-event', async (_event, input) => {
    log.info('Received before-input-event:', { id: webContents.id, key: input.key, meta: input.meta });
    if (isCmdOrCtrlKeyAndFKey(input) || isEscapeKey(input)) {
      if (isLoadmillWebPage) {
        log.info('Web page view is focused, checking CodeMirror active element');
        const isCodeMirrorContextActive = await webContents.executeJavaScript(`
          (() => {
            const active = document.activeElement;
            if (!active || typeof active.closest !== 'function') return false;
            // CodeMirror moves focus to its own UI (e.g., search/replace panel input),
            // which may NOT set .cm-editor.cm-focused.
            return Boolean(active.closest('.cm-editor, .cm-panels, .cm-panel, .cm-tooltip'));
          })();
        `);
        if (isCodeMirrorContextActive) {
          log.info('CodeMirror context is active, do nothing');
          return;
        }
      }
      if (isCmdOrCtrlKeyAndFKey(input)) {
        log.info('Opening find on page');
        getMainWindow().webContents.focus();
        sendFromMainWindowToRenderer({
          data: { shouldShowFind: true },
          type: SHOW_FIND_ON_PAGE,
        });
      } else if (isEscapeKey(input)) {
        log.info('Closing find on page');
        webContents.focus();
        sendFromMainWindowToRenderer({
          data: { shouldShowFind: false },
          type: SHOW_FIND_ON_PAGE,
        });
      }
    }
  });
};

const isCmdOrCtrlKeyAndFKey = (input: Electron.Input) =>
  isCmdOrCtrlKey(input) && isFKey(input);

const isFKey = (input: Electron.Input) =>
  input.key.toLowerCase() === 'f';

const isEscapeKey = (input: Electron.Input) =>
  input.key.toLowerCase() === 'escape';

const isCmdOrCtrlKey = (input: Electron.Input) =>
  input.meta || input.control;
