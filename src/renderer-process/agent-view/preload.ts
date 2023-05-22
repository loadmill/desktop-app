import { contextBridge } from 'electron';

import { sendToMain } from '../../inter-process-communication/renderer-to-main';
import { ApiForLoadmillAgentView } from '../../types/api';
import { AgentRendererMessage } from '../../types/messaging';
import { DESKTOP_API, DOWNLOAD_AGENT_LOG, STDERR, STDOUT } from '../../universal/constants';
import { subscribeToAgentViewMessages } from '../renderer-events';

export const WINDOW_API: ApiForLoadmillAgentView = {
  [DOWNLOAD_AGENT_LOG]: () => sendToMain(DOWNLOAD_AGENT_LOG),
};

subscribeToAgentViewMessages(STDOUT, (_event: Electron.IpcRendererEvent, data: AgentRendererMessage['data']) => {
  window.postMessage({ data, type: STDOUT });
});

subscribeToAgentViewMessages(STDERR, (_event: Electron.IpcRendererEvent, data: AgentRendererMessage['data']) => {
  window.postMessage({ data, type: STDERR });
});

contextBridge.exposeInMainWorld(DESKTOP_API, WINDOW_API);
