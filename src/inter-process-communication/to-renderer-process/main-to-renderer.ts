import { WebContents } from 'electron';

import log from '../../log';
import { getMainWindow } from '../../main-process/main-window';
import { getStartupWindow } from '../../main-process/startup-window';
import { getViewByName } from '../../main-process/views';
import {
  AgentRendererMessage,
  LoadmillViewRendererMessage,
  MainWindowRendererMessage,
  ProxyRendererMessage,
  RendererMessage,
  SettingsRendererMessage,
  StartupRendererMessage,
} from '../../types/messaging';
import { ViewName } from '../../types/views';

export const sendFromMainWindowToRenderer = ({ type, data }: MainWindowRendererMessage): void => {
  _sendToRenderer(getMainWindow()?.webContents, { data, type });
};

export const sendFromStartupWindowToRenderer = ({ type, data }: StartupRendererMessage): void => {
  _sendToRenderer(getStartupWindow()?.webContents, { data, type });
};

export const sendFromAgentViewToRenderer = ({ type, data }: AgentRendererMessage): void => {
  _sendToRenderer(getViewByName(ViewName.AGENT)?.webContents, { data, type });
};

export const sendFromProxyViewToRenderer = ({ type, data }: ProxyRendererMessage): void => {
  _sendToRenderer(getViewByName(ViewName.PROXY)?.webContents, { data, type });
};

export const sendFromSettingsViewToRenderer = ({ type, data }: SettingsRendererMessage): void => {
  _sendToRenderer(getViewByName(ViewName.SETTINGS)?.webContents, { data, type });
};

export const sendFromLoadmillViewToRenderer = ({ type, data }: LoadmillViewRendererMessage): void => {
  _sendToRenderer(getViewByName(ViewName.WEB_PAGE)?.webContents, { data, type });
};

const _sendToRenderer = (webContents: WebContents, { type, data }: RendererMessage) => {
  try {
    if (!webContents) {
      throw new Error('No webContents found');
    }
    log.debug('Sending to renderer', JSON.stringify({ data, type }, null, 2));
    webContents.send(type, data);
  } catch (e) {
    log.error('Error in send to renderer', { data, type }, e);
  }
};
