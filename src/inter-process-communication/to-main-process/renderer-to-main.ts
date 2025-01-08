import { ipcRenderer } from 'electron';

import log from '../../log';
import { MainMessage, MainMessageTypes } from '../../types/messaging';

export const sendToMain = (type: MainMessageTypes, data?: MainMessage['data']): void => {
  try {
    log.debug('Sending to main', JSON.stringify({ data, type }, null, 2));
    ipcRenderer.send(type, data);
    // ipcRenderer.send(RELAY_TO_VIEWS, { channel: type, data });
  } catch (e) {
    log.error('error in send to main', e);
  }
};
