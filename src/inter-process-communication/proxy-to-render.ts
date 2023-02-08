/**
 * This module provides a nice interface to send messages from main process to renderer process.
 */
import { WebContents } from 'electron';

import log from '../log';
import { ProxyRendererMessage } from '../types/messaging';

const ProxyToRender = {
  proxyWebContents: null as WebContents,
};

export const initProxyToRenderer = (proxyWebContents: WebContents): void => {
  ProxyToRender.proxyWebContents = proxyWebContents;
};

export const sendFromProxyToRenderer = ({ type, data }: ProxyRendererMessage): void => {
  try {
    if (ProxyToRender.proxyWebContents) {
      log.debug('Sending to proxy renderer', { data, type });
      ProxyToRender.proxyWebContents.send(type, data);
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
