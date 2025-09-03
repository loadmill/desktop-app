import { BrowserWindow } from 'electron';

let startupWindow: BrowserWindow | null = null;

export const setStartupWindow = (window: BrowserWindow | null): void => {
  startupWindow = window;
};

export const getStartupWindow = (): BrowserWindow | null => {
  return startupWindow;
};
