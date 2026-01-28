import { AgentStatus } from '../../types/agent-status';
import { textToNonEmptyLines } from '../../universal/utils';

/**
 * AgentLogParser - Pure functions to parse agent logs and determine status
 *
 * This module contains pure functions that analyze agent log output
 * and return the appropriate status. No state is managed here.
 */

export interface StatusUpdate {
  reason?: string;
  status: AgentStatus | null;
}

/**
 * Parse agent log text and determine if status should change
 * Returns null if no status change is detected
 */
export function parseAgentLog(text: string): StatusUpdate {
  const lines = textToNonEmptyLines(text);

  // Check for connected status
  if (lines.some(l => l.includes('Successfully connected to Loadmill'))) {
    return {
      reason: 'Connected to Loadmill',
      status: AgentStatus.CONNECTED,
    };
  }

  // Check for outdated agent
  if (lines.some(l => l.includes('The agent is outdated'))) {
    return {
      reason: 'Agent version is outdated',
      status: AgentStatus.OUTDATED,
    };
  }

  // Check for disconnected status (multiple patterns)
  const disconnectPatterns = [
    'Shutting down gracefully',
    'Disconnected from Loadmill',
    'Agent disconnected from server',
  ];

  if (lines.some(l => disconnectPatterns.some(pattern => l.includes(pattern)))) {
    return {
      reason: 'Disconnected from server',
      status: AgentStatus.DISCONNECTED,
    };
  }

  // Check for errors
  if (lines.some(l => l.includes('[ERROR]') && !l.includes('The agent is outdated'))) {
    // Note: We don't change to ERROR status on every error log,
    // only on critical errors. Most errors are handled by other mechanisms.
    // If needed, add specific error patterns here.
  }

  return { status: null };
}

/**
 * Check if log text indicates an invalid token error
 */
export function hasInvalidTokenError(text: string): boolean {
  return text.includes('Invalid token');
}

/**
 * Check if log text indicates an outdated agent error
 */
export function hasOutdatedAgentError(text: string): boolean {
  return text.includes('[ERROR] The agent is outdated');
}

/**
 * Translate boolean connection status from IPC to AgentStatus enum
 * This is used when the agent process sends connection status via IPC
 */
export function booleanToStatus(isConnected: boolean): AgentStatus {
  return isConnected ? AgentStatus.CONNECTED : AgentStatus.DISCONNECTED;
}
