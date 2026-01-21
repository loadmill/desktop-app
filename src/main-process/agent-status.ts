import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import type { AgentStatus } from '../types/agent-status';
import {
  AGENT_STATUS_CONNECTED,
  AGENT_STATUS_CONNECTING,
  AGENT_STATUS_DISCONNECTED,
  AGENT_STATUS_DISCONNECTING,
  AGENT_STATUS_ERROR,
  AGENT_STATUS_OUTDATED,
  AGENT_STATUS_RESTARTING,
  IS_AGENT_CONNECTED,
} from '../universal/constants';

import {
  isAgentConnected,
  refreshConnectedStatus,
} from './connected-status';

const AGENT_STATUS_TIMEOUT_MS = 25_000;

let agentStatusTimeout: NodeJS.Timeout | null = null;
let lastSentAgentStatus: AgentStatus = AGENT_STATUS_DISCONNECTED;

const isLoadingAgentStatus = (status: AgentStatus) =>
  [
    AGENT_STATUS_CONNECTING,
    AGENT_STATUS_DISCONNECTING,
    AGENT_STATUS_RESTARTING,
  ].includes(status);

const clearAgentStatusTimeout = () => {
  if (agentStatusTimeout) {
    clearTimeout(agentStatusTimeout);
    agentStatusTimeout = null;
  }
};

const armAgentStatusTimeout = (status: AgentStatus) => {
  clearAgentStatusTimeout();
  if (!isLoadingAgentStatus(status)) {
    return;
  }

  agentStatusTimeout = setTimeout(() => {
    log.warn('Timed out waiting for agent state transition', {
      isAgentConnected: isAgentConnected(),
      lastSentAgentStatus,
      timeoutMs: AGENT_STATUS_TIMEOUT_MS,
    });
    sendAgentStatusToMainWindow(AGENT_STATUS_ERROR, isAgentConnected());
  }, AGENT_STATUS_TIMEOUT_MS);
};

export const sendAgentStatusToMainWindow = (
  agentStatus: AgentStatus,
  isConnected?: boolean,
): void => {
  lastSentAgentStatus = agentStatus;

  if (isLoadingAgentStatus(agentStatus)) {
    armAgentStatusTimeout(agentStatus);
  } else {
    clearAgentStatusTimeout();
  }

  const isAgentConnectedPayload = typeof isConnected === 'boolean'
    ? { isAgentConnected: isConnected }
    : {};
  sendFromMainWindowToRenderer({
    data: {
      agentStatus: agentStatus,
      ...isAgentConnectedPayload,
    },
    type: IS_AGENT_CONNECTED,
  });
};

export const sendAgentConnected = (): void => {
  sendAgentStatusToMainWindow(AGENT_STATUS_CONNECTED, true);
};

export const sendAgentDisconnected = (isConnected = false): void => {
  sendAgentStatusToMainWindow(AGENT_STATUS_DISCONNECTED, isConnected);
};

export const sendAgentConnecting = (): void => {
  sendAgentStatusToMainWindow(AGENT_STATUS_CONNECTING, false);
};

export const sendAgentDisconnecting = (isConnected = true): void => {
  sendAgentStatusToMainWindow(AGENT_STATUS_DISCONNECTING, isConnected);
};

export const sendAgentOutdated = (): void => {
  sendAgentStatusToMainWindow(AGENT_STATUS_OUTDATED, false);
};

export const isPendingConnectOrRestart = (): boolean => (
  lastSentAgentStatus === AGENT_STATUS_CONNECTING
  || lastSentAgentStatus === AGENT_STATUS_RESTARTING
);

export const markAgentDisconnected = (
  agentStatus: AgentStatus = AGENT_STATUS_DISCONNECTED,
): void => {
  refreshConnectedStatus({ isConnected: false });
  sendAgentStatusToMainWindow(agentStatus, false);
};

export const markAgentRestarting = (): void => {
  markAgentDisconnected(AGENT_STATUS_RESTARTING);
};
