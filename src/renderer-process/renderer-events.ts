import { ipcRenderer } from 'electron';

import {
  AgentRendererMessage,
  AgentRendererMessageTypes,
  LoadmillViewRendererMessage,
  LoadmillViewRendererMessageTypes,
  MainWindowRendererMessage,
  ProxyRendererMessage,
  ProxyRendererMessageTypes,
  RendererMessageTypes,
  SettingsRendererMessage,
  SettingsRendererMessageTypes,
} from '../types/messaging';

export enum Renderer {
  AGENT_VIEW = 'agentView',
  LOADMILL_VIEW = 'loadmillView',
  MAIN_WINDOW = 'mainWindow',
  PROXY_VIEW = 'proxyView',
}

export const subscribeToMainWindowMessages = (
  type: RendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: MainWindowRendererMessage['data']) => void,
): void => {
  ipcRenderer.on(type, handler);
};

export const subscribeToLoadmillViewMessages = (
  type: LoadmillViewRendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: LoadmillViewRendererMessage['data']) => void,
): void => {
  ipcRenderer.on(type, handler);
};

export const subscribeToProxyViewMessages = (
  type: ProxyRendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: ProxyRendererMessage['data']) => void,
): void => {
  ipcRenderer.on(type, handler);
};

export const subscribeToAgentViewMessages = (
  type: AgentRendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: AgentRendererMessage['data']) => void,
): void => {
  ipcRenderer.on(type, handler);
};

export const subscribeToSettingsViewMessages = (
  type: SettingsRendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: SettingsRendererMessage['data']) => void,
): void => {
  ipcRenderer.on(type, handler);
};
