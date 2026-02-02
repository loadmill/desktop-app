import {
  sendFromMainWindowToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { AgentStatus } from '../../universal/agent-status';
import { AGENT_STATUS_CHANGED } from '../../universal/constants';

import { agentStatusManager } from './agent-status-manager';

export const initializeStatusNotifier = (): void => {
  agentStatusManager.onStatusChange((newStatus) => {
    notifyMainWindow(newStatus);
  });
  log.info('Agent status notifier initialized');
};

const notifyMainWindow = (agentStatus: AgentStatus): void => {
  log.info('Notifying main window of status change', { agentStatus });

  sendFromMainWindowToRenderer({
    data: {
      agentStatus: _translateBackendStatusToUiStatus(agentStatus),
    },
    type: AGENT_STATUS_CHANGED,
  });
};

const _translateBackendStatusToUiStatus = (backendStatus: AgentStatus): AgentStatus => {
  if (backendStatus === AgentStatus.INVALID_TOKEN) {
    return AgentStatus.CONNECTING;
  }
  return backendStatus;
};
