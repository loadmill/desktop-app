import { ipcRenderer } from 'electron';

import {
  LoadmillViewRendererMessage,
  LoadmillViewRendererMessageTypes,
  ProxyRendererMessage,
  ProxyRendererMessageTypes,
  RendererMessage,
  RendererMessageTypes
} from '../types/messaging';

export enum Renderer {
  LOADMILL_VIEW = 'loadmillView',
  MAIN_WINDOW = 'mainWindow',
  PROXY_WINDOW = 'proxyView',
}

export const subscribeToMainWindowMessages = (
  type: RendererMessageTypes,
  handler: (event?: Electron.IpcRendererEvent, data?: RendererMessage['data']) => void,
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
