import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export const setMainWindow = (window: BrowserWindow): void => {
  mainWindow = window;
};

export const getMainWindow = (): BrowserWindow | null => {
  return mainWindow;
};
