import { ipcMain } from 'electron';

import { GET_TOKEN, SET_POTENTIAL_TOKEN } from './constants';
import { send as sendToRenderer } from './main-to-renderer';
import { getValidToken, setPotentialToken } from './token';

const subscribeToGetTokenRenderer = () => {
  ipcMain.on(GET_TOKEN, (_event: Electron.IpcMainEvent) => {
    const token = getValidToken();
    sendToRenderer({
      data: { token },
      type: GET_TOKEN,
    });
  });
};

const subscribeToSetPotentialTokenRenderer = () => {
  ipcMain.on(SET_POTENTIAL_TOKEN, (_event: Electron.IpcMainEvent, token: string) => {
    setPotentialToken(token);
  });
};

subscribeToGetTokenRenderer();
subscribeToSetPotentialTokenRenderer();
