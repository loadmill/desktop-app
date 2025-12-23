import { sendFromMainWindowToRenderer } from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { ViewName } from '../types/views';
import { SHOW_FIND_ON_PAGE } from '../universal/constants';

import { getMainWindow } from './main-window';
import { getViewByName, getViews } from './views';

type KeybindingSubscriptionTarget = {
  name: string;
  webContents: Electron.WebContents;
};

type FindInPageAction = 'open' | 'close';

export const subscribeToKeybindings = (): void => {
  log.info('Setting up keybindings...');
  const subscriptionTargets = getKeybindingSubscriptionTargets();

  log.info('Subscribing to before-input-event on targets', {
    subscriptionTargets: subscriptionTargets.map((t) => ({ id: t.webContents.id, name: t.name })),
  });

  for (const target of subscriptionTargets) {
    subscribeToFindInPageShortcuts(target);
  }
  log.info('Keybindings setup complete.');
};

const getKeybindingSubscriptionTargets = (): KeybindingSubscriptionTarget[] => {
  const mainWindow = getMainWindow();
  const views = getViews();

  return [
    { name: 'mainWindow', webContents: mainWindow.webContents },
    ...views.map((v) => ({ name: v.name, webContents: v.view.webContents })),
  ];
};

const subscribeToFindInPageShortcuts = (target: KeybindingSubscriptionTarget) => {
  log.info('Subscribing to before-input-event (find in page) for target', { id: target.webContents.id, name: target.name });
  const { webContents } = target;
  webContents.on('before-input-event', async (event, input) => {
    try {
      if (input.type !== 'keyDown') {
        return;
      }

      const action = getFindAction(input);
      if (!action) {
        return;
      }

      if (await shouldIgnoreFindInPageShortcuts(webContents)) {
        log.info('Ignoring find-in-page shortcut: CodeMirror context active');
        return;
      }

      event.preventDefault();

      if (action === 'open') {
        handleOpenFindOnPage();
        return;
      }

      handleCloseFindOnPage(webContents);
    } catch (error) {
      log.error('Error while handling before-input-event', error);
    }
  });
};

const isLoadmillWebPage = (webContents: Electron.WebContents): boolean =>
  webContents.id === getViewByName(ViewName.WEB_PAGE)?.webContents.id;

const shouldIgnoreFindInPageShortcuts = async (webContents: Electron.WebContents): Promise<boolean> =>
  isLoadmillWebPage(webContents) &&
  await isCodeMirrorContextActive(webContents);

const getFindAction = (input: Electron.Input): FindInPageAction | null => {
  if (isCmdOrCtrlKeyAndFKey(input)) {
    return 'open';
  }
  if (isEscapeKey(input)) {
    return 'close';
  }
  return null;
};

const isCodeMirrorContextActive = async (webContents: Electron.WebContents): Promise<boolean> => {
  try {
    return await webContents.executeJavaScript(`
      (() => {
        const active = document.activeElement;
        if (!active || typeof active.closest !== 'function') return false;
        // CodeMirror moves focus to its own UI (e.g., search/replace panel input),
        // which may NOT set .cm-editor.cm-focused.
        return Boolean(active.closest('.cm-editor, .cm-panels, .cm-panel, .cm-tooltip'));
      })();
    `);
  } catch (error) {
    log.error('Error while checking if CodeMirror context is active', error);
    return false;
  }
};

const handleOpenFindOnPage = () => {
  log.info('Opening find on page');
  getMainWindow().webContents.focus();
  sendFromMainWindowToRenderer({
    data: { shouldShowFind: true },
    type: SHOW_FIND_ON_PAGE,
  });
};

const handleCloseFindOnPage = (webContents: Electron.WebContents) => {
  log.info('Closing find on page');
  webContents.focus();
  sendFromMainWindowToRenderer({
    data: { shouldShowFind: false },
    type: SHOW_FIND_ON_PAGE,
  });
};

const isCmdOrCtrlKeyAndFKey = (input: Electron.Input) =>
  isCmdOrCtrlKey(input) && isFKey(input);

const isCmdOrCtrlKey = (input: Electron.Input) =>
  input.meta || input.control;

const isFKey = (input: Electron.Input) =>
  input.key.toLowerCase() === 'f';

const isEscapeKey = (input: Electron.Input) =>
  input.key.toLowerCase() === 'escape';
