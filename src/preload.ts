import { contextBridge, ipcRenderer } from 'electron';

import {
  API,
  CHECK_FOR_UPDATES,
  GET_TOKEN,
  INIT_AGENT_LOG,
  IS_AGENT_CONNECTED,
  SET_POTENTIAL_TOKEN,
  START_AGENT,
  STDERR,
  STDOUT,
  STOP_AGENT,
} from './constants';
import { ProcessMessageRenderer } from './types/messaging';

export const WINDOW_API = {
  checkForUpdates: (msg?: string): void => ipcRenderer.send(CHECK_FOR_UPDATES, msg),
  getToken: (msg?: string): void => ipcRenderer.send(GET_TOKEN, msg),
  initAgentLog: (msg?: string): void => ipcRenderer.send(INIT_AGENT_LOG, msg),
  isAgentConnected: (msg?: string): void => ipcRenderer.send(IS_AGENT_CONNECTED, msg),
  setPotentialToken: (msg: string): void => ipcRenderer.send(SET_POTENTIAL_TOKEN, msg),
  startAgent: (msg: string): void => ipcRenderer.send(START_AGENT, msg),
  stopAgent: (msg?: string): void => ipcRenderer.send(STOP_AGENT, msg),
};

const windowLoaded = new Promise(resolve => {
  window.onload = resolve;
});

ipcRenderer.on(STDOUT, async (_event: Electron.IpcRendererEvent, msg: string) => {
  await windowLoaded;
  window.postMessage({ data: msg, type: STDOUT });
});

ipcRenderer.on(STDERR, async (_event: Electron.IpcRendererEvent, msg: string) => {
  await windowLoaded;
  window.postMessage({ data: msg, type: STDERR });
});

ipcRenderer.on(IS_AGENT_CONNECTED, async (_event: Electron.IpcRendererEvent, msg: string) => {
  await windowLoaded;
  window.postMessage({ data: msg, type: IS_AGENT_CONNECTED });
});

ipcRenderer.on(INIT_AGENT_LOG, async (_event: Electron.IpcRendererEvent, msg: string) => {
  await windowLoaded;
  window.postMessage({ data: msg, type: INIT_AGENT_LOG });
});

ipcRenderer.on(GET_TOKEN, async (_event: Electron.IpcRendererEvent, data: ProcessMessageRenderer['data']) => {
  await windowLoaded;
  window.postMessage({ data, type: GET_TOKEN });
});

contextBridge.exposeInMainWorld(API, WINDOW_API);
