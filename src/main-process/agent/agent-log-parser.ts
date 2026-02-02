import { AgentStatus } from '../../universal/agent-status';
import { textToNonEmptyLines } from '../../universal/utils';

export interface StatusUpdate {
  reason?: string;
  status: AgentStatus | null;
}

export const parseAgentLog = (text: string): StatusUpdate => {
  const lines = textToNonEmptyLines(text);

  if (lines.some(l => l.includes('Successfully connected to Loadmill'))) {
    return {
      reason: 'Connected to Loadmill',
      status: AgentStatus.CONNECTED,
    };
  }

  if (lines.some(l => l.includes('The agent is outdated'))) {
    return {
      reason: 'Agent version is outdated',
      status: AgentStatus.OUTDATED,
    };
  }

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

  return { status: null };
};

export function hasInvalidTokenError(text: string): boolean {
  return text.includes('Invalid token');
}

export function hasOutdatedAgentError(text: string): boolean {
  return text.includes('[ERROR] The agent is outdated');
}
