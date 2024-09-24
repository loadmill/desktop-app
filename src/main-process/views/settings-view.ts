import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { subscribeToSettingsEvents } from '../settings';

import { createView } from './view-factory';

declare const SETTINGS_VIEW_WEBPACK_ENTRY: string;
declare const SETTINGS_VIEW_PRELOAD_WEBPACK_ENTRY: string;

export const createSettingsView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const settingsView = createView(mainWindow, {
    openDevTools: true,
    preload: SETTINGS_VIEW_PRELOAD_WEBPACK_ENTRY,
    url: SETTINGS_VIEW_WEBPACK_ENTRY,
  });
  subscribeToSettingsEvents();
  return settingsView;
};
