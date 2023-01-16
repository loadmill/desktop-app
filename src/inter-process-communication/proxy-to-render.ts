/**
 * This module provides a nice interface to send messages from main process to renderer process.
 */
import { BrowserWindow } from 'electron';

import log from '../log';
import { ProxyRendererMessage } from '../types/messaging';

const ProxyToRender = {
  proxyWindow: null as BrowserWindow,
};

export const initProxyToRenderer = (proxyWindow: BrowserWindow): void => {
  ProxyToRender.proxyWindow = proxyWindow;
};

export const sendFromProxyToRenderer = ({ type, data }: ProxyRendererMessage): void => {
  try {
    if (ProxyToRender.proxyWindow?.webContents) {
      log.debug('Sending to proxy renderer', { data, type });
      ProxyToRender.proxyWindow.webContents.send(type, data);
    } else {
      log.warn('Cannot send from Proxy process to Renderer Process. Reason: No proxyWindow on ProxyToRender object.', {
        data,
        type,
      });
    }
  } catch (e) {
    log.error('error in send proxy to renderer', e);
  }
};
