import { app, BrowserWindow, WebContentsView } from 'electron';

import { RESIZE } from '../../universal/constants';
import { subscribeToFindOnPageEvents } from '../find-on-page';
import { setOpenLinksInBrowser } from '../open-links';
import { setBrowserViewSize } from '../screen-size';

export const createView = (
  mainWindow: BrowserWindow,
  {
    preload,
    url,
    openDevTools = false,
  }: ViewOptions,
): WebContentsView => {
  const view = new WebContentsView({
    webPreferences: {
      preload,
    },
  });
  mainWindow.contentView.addChildView(view);
  setOpenLinksInBrowser(view.webContents);
  const handleWindowResize = (_e: Electron.Event) => {
    setBrowserViewSize(view, mainWindow.getBounds());
  };
  mainWindow.on(RESIZE, handleWindowResize);
  view.webContents.loadURL(url);
  subscribeToFindOnPageEvents(view.webContents);
  if (!app.isPackaged && openDevTools) {
    view.webContents.openDevTools();
  }
  return view;
};

type ViewOptions = {
  openDevTools?: boolean;
  preload: string;
  url: string;
};
