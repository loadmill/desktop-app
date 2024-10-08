/**
 * This module provides a nice interface to send messages from main process to renderer process.
 */

import log from '../../log';
import { getMainWindow } from '../../main-process/main-window';
import { getViewByName } from '../../main-process/views';
import {
  AgentRendererMessage,
  MainWindowRendererMessage,
  ProxyRendererMessage,
  RendererMessage,
  SettingsRendererMessage,
} from '../../types/messaging';
import { ViewName } from '../../types/views';

export const sendFromMainWindowToRenderer = ({ type, data }: MainWindowRendererMessage): void => {
  _sendToRenderer({ data, type });
};

export const sendFromAgentViewToRenderer = ({ type, data }: AgentRendererMessage): void => {
  _sendToRenderer({ data, type }, ViewName.AGENT);
};

export const sendFromProxyViewToRenderer = ({ type, data }: ProxyRendererMessage): void => {
  _sendToRenderer({ data, type }, ViewName.PROXY);
};

export const sendFromSettingsViewToRenderer = ({ type, data }: SettingsRendererMessage): void => {
  _sendToRenderer({ data, type }, ViewName.SETTINGS);
};

const _sendToRenderer = ({ type, data }: RendererMessage, viewName?: ViewName): void => {
  try {
    const viewOrWindow = viewName ? getViewByName(viewName) : getMainWindow();
    const webContents = viewOrWindow?.webContents;
    if (!webContents) {
      throw new Error('No webContents found');
    }
    log.debug('Sending to renderer', { data, type, viewName });
    webContents.send(type, data);
  } catch (e) {
    log.error('Error in send to renderer', { data, type, viewName }, e);
  }
};
