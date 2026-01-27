import {
  sendFromMainWindowToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { AgentStatus } from '../../types/agent-status';
import { AGENT_STATUS_CHANGED, IS_AGENT_OUTDATED } from '../../universal/constants';

import { agentStatusManager } from './agent-status-manager';

/**
 * AgentStatusNotifier - Observes status changes and notifies external systems
 *
 * This module handles the side effects of status changes:
 * - Sends updates to the renderer process (UI)
 * - Handles special notifications (like outdated agent)
 *
 * It subscribes to the AgentStatusManager and reacts to changes.
 */

/**
 * Initialize the notifier - subscribes to status changes
 * Call this once during app initialization
 */
export function initializeStatusNotifier(): void {
  agentStatusManager.onStatusChange((newStatus) => {
    notifyMainWindow(newStatus);
  });
  log.info('Agent status notifier initialized');
}

/**
 * Send status update to the main window (UI)
 */
function notifyMainWindow(agentStatus: AgentStatus): void {
  log.info('Notifying main window of status change', { agentStatus });

  sendFromMainWindowToRenderer({
    data: {
      agentStatus,
    },
    type: AGENT_STATUS_CHANGED,
  });
}

/**
 * Send outdated agent notification to the main window
 * This is a special notification that includes additional data
 */
export function notifyAgentOutdated(): void {
  log.info('Notifying main window that agent is outdated');

  sendFromMainWindowToRenderer({
    data: {
      isAgentOutdated: true,
    },
    type: IS_AGENT_OUTDATED,
  });
}
