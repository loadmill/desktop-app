import '@loadmill/agent/dist/cli';

import {
  disconnectAgent,
  subscribeToAgentEventsFromRenderer,
} from './agent-ipc-handlers';
import { initializeLogProcessor } from './agent-log-processor';
import {
  killAgentProcess,
  sendToAgentProcess,
} from './agent-process-manager';
import { initializeStatusNotifier } from './agent-status-notifier';

export const initializeAgentSystem = (): void => {
  initializeStatusNotifier();
  initializeLogProcessor(sendToAgentProcess, disconnectAgent);
  subscribeToAgentEventsFromRenderer();
};

export {
  killAgentProcess,
};
