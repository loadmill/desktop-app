import { ipcRenderer } from 'electron';

import log from '../log';
import { MainMessage, MainMessageTypes } from '../types/messaging';

export const sendToMain = (type: MainMessageTypes, data?: MainMessage['data']): void => {
  try {
    log.debug('Sending to main', { data, type });
    ipcRenderer.send(type, data);
  } catch (e) {
    log.error('error in send to main', e);
  }
};
