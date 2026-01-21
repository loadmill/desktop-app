import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { AgentStatus } from '../types/agent-status';
import { IS_AGENT_CONNECTED } from '../universal/constants';

import {
  isAgentConnected,
  refreshConnectedStatus,
} from './connected-status';

const AGENT_STATUS_TIMEOUT_MS = 25_000;

let agentStatusTimeout: NodeJS.Timeout | null = null;
let lastSentAgentStatus: AgentStatus = AgentStatus.DISCONNECTED;

const isLoadingAgentStatus = (status: AgentStatus) =>
  [
    AgentStatus.CONNECTING,
    AgentStatus.DISCONNECTING,
    AgentStatus.RESTARTING,
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
    sendAgentStatusToMainWindow(AgentStatus.ERROR, isAgentConnected());
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
  sendAgentStatusToMainWindow(AgentStatus.CONNECTED, true);
};

export const sendAgentDisconnected = (isConnected = false): void => {
  sendAgentStatusToMainWindow(AgentStatus.DISCONNECTED, isConnected);
};

export const sendAgentConnecting = (): void => {
  sendAgentStatusToMainWindow(AgentStatus.CONNECTING, false);
};

export const sendAgentDisconnecting = (isConnected = true): void => {
  sendAgentStatusToMainWindow(AgentStatus.DISCONNECTING, isConnected);
};

export const sendAgentOutdated = (): void => {
  sendAgentStatusToMainWindow(AgentStatus.OUTDATED, false);
};

export const isPendingConnectOrRestart = (): boolean => (
  lastSentAgentStatus === AgentStatus.CONNECTING
  || lastSentAgentStatus === AgentStatus.RESTARTING
);

export const markAgentDisconnected = (
  agentStatus: AgentStatus = AgentStatus.DISCONNECTED,
): void => {
  refreshConnectedStatus({ isConnected: false });
  sendAgentStatusToMainWindow(agentStatus, false);
};

export const markAgentRestarting = (): void => {
  markAgentDisconnected(AgentStatus.RESTARTING);
};
