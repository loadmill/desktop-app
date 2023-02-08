import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import {
  RESIZE,
} from '../universal/constants';

import { setOpenLinksInBrowser } from './open-links';

const TITLE_BAR_HEIGHT = 44;

export const createDummyWebView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const dummyView = new BrowserView({});
  mainWindow.addBrowserView(dummyView);
  setOpenLinksInBrowser(dummyView.webContents);
  setDummyViewSize(dummyView, mainWindow.getBounds());

  const handleWindowResize = (_e: Electron.Event) => {
    setDummyViewSize(dummyView, mainWindow.getBounds());
  };
  mainWindow.on(RESIZE, handleWindowResize);

  dummyView.webContents.loadURL('https://www.loadmill.com');

  return dummyView;
};

export const setDummyViewSize = (view: BrowserView, bounds: Electron.Rectangle): void => {
  view.setBounds({
    height: bounds.height - TITLE_BAR_HEIGHT,
    width: bounds.width,
    x: 0,
    y: TITLE_BAR_HEIGHT,
  });
};
