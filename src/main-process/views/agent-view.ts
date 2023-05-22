import {
  BrowserView,
  BrowserWindow,
} from 'electron';

import { initMainToAgent } from '../../inter-process-communication/main-to-agent';
import { subscribeToDownloadAgentLog } from '../agent/download-agent-log';

import { createView } from './view-factory';

declare const AGENT_VIEW_WEBPACK_ENTRY: string;
declare const AGENT_VIEW_PRELOAD_WEBPACK_ENTRY: string;

export const createAgentView = (
  mainWindow: BrowserWindow,
): BrowserView => {
  const agent = createView(mainWindow, {
    openDevTools: true,
    preload: AGENT_VIEW_PRELOAD_WEBPACK_ENTRY,
    url: AGENT_VIEW_WEBPACK_ENTRY,
  });

  initMainToAgent(agent.webContents);
  subscribeToDownloadAgentLog();
  return agent;
};
