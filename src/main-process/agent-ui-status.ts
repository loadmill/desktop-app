import {
  sendFromMainWindowToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import type { AgentUiStatus } from '../types/agent-ui';
import {
  AGENT_UI_STATUS_CONNECTED,
  AGENT_UI_STATUS_CONNECTING,
  AGENT_UI_STATUS_DISCONNECTED,
  AGENT_UI_STATUS_DISCONNECTING,
  AGENT_UI_STATUS_ERROR,
  AGENT_UI_STATUS_OUTDATED,
  AGENT_UI_STATUS_RESTARTING,
  IS_AGENT_CONNECTED,
} from '../universal/constants';

import {
  isAgentConnected,
  refreshConnectedStatus,
} from './connected-status';

const AGENT_UI_STATUS_TIMEOUT_MS = 25_000;

let agentUiStatusTimeout: NodeJS.Timeout | null = null;
let lastSentAgentUiStatus: AgentUiStatus = AGENT_UI_STATUS_DISCONNECTED;

const isLoadingAgentUiStatus = (status: AgentUiStatus) =>
  [
    AGENT_UI_STATUS_CONNECTING,
    AGENT_UI_STATUS_DISCONNECTING,
    AGENT_UI_STATUS_RESTARTING,
  ].includes(status);

const clearAgentUiStatusTimeout = () => {
  if (agentUiStatusTimeout) {
    clearTimeout(agentUiStatusTimeout);
    agentUiStatusTimeout = null;
  }
};

const armAgentUiStatusTimeout = (status: AgentUiStatus) => {
  clearAgentUiStatusTimeout();
  if (!isLoadingAgentUiStatus(status)) {
    return;
  }

  agentUiStatusTimeout = setTimeout(() => {
    log.warn('Timed out waiting for agent state transition', {
      isAgentConnected: isAgentConnected(),
      lastSentAgentUiStatus,
      timeoutMs: AGENT_UI_STATUS_TIMEOUT_MS,
    });
    sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_ERROR, isAgentConnected());
  }, AGENT_UI_STATUS_TIMEOUT_MS);
};

export const sendAgentUiStatusToMainWindow = (
  agentUiStatus: AgentUiStatus,
  isConnected?: boolean,
): void => {
  lastSentAgentUiStatus = agentUiStatus;

  if (isLoadingAgentUiStatus(agentUiStatus)) {
    armAgentUiStatusTimeout(agentUiStatus);
  } else {
    clearAgentUiStatusTimeout();
  }

  const isAgentConnectedPayload = typeof isConnected === 'boolean'
    ? { isAgentConnected: isConnected }
    : {};
  sendFromMainWindowToRenderer({
    data: {
      agentUiStatus,
      ...isAgentConnectedPayload,
    },
    type: IS_AGENT_CONNECTED,
  });
};

export const sendAgentUiConnected = (): void => {
  sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_CONNECTED, true);
};

export const sendAgentUiDisconnected = (isConnected = false): void => {
  sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_DISCONNECTED, isConnected);
};

export const sendAgentUiConnecting = (): void => {
  sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_CONNECTING, false);
};

export const sendAgentUiDisconnecting = (isConnected = true): void => {
  sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_DISCONNECTING, isConnected);
};

export const sendAgentUiOutdated = (): void => {
  sendAgentUiStatusToMainWindow(AGENT_UI_STATUS_OUTDATED, false);
};

export const isPendingConnectOrRestart = (): boolean => (
  lastSentAgentUiStatus === AGENT_UI_STATUS_CONNECTING
  || lastSentAgentUiStatus === AGENT_UI_STATUS_RESTARTING
);

export const markAgentDisconnected = (
  agentUiStatus: AgentUiStatus = AGENT_UI_STATUS_DISCONNECTED,
): void => {
  refreshConnectedStatus({ isConnected: false });
  sendAgentUiStatusToMainWindow(agentUiStatus, false);
};

export const markAgentRestarting = (): void => {
  markAgentDisconnected(AGENT_UI_STATUS_RESTARTING);
};
