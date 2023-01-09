import { shell, WebContents } from 'electron';

export const setOpenLinksInBrowser = (webContents: WebContents): void => {
  webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};
