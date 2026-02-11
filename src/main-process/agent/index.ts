import '@loadmill/agent/dist/cli';

import {
  subscribeToAgentEventsFromRenderer,
  subscribeToAgentStatusChanges,
} from './agent-ipc-handlers';
import {
  killAgentProcess,
} from './agent-process-manager';
import { initializeStatusNotifier } from './agent-status-notifier';

export const initializeAgentSystem = (): void => {
  initializeStatusNotifier();
  subscribeToAgentStatusChanges();
  subscribeToAgentEventsFromRenderer();
};

export {
  killAgentProcess,
};
