import { ipcMain } from 'electron';

import log from '../../log';
import { MainMessage } from '../../types/messaging';
import { AgentStatus } from '../../universal/agent-status';
import {
  AGENT_CONNECT,
  AGENT_DISCONNECT,
  FETCH_PROFILES,
  FETCH_SUITES,
  SET_IS_USER_SIGNED_IN,
  START_AGENT,
  STOP_AGENT,
} from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
import { get, set } from '../persistence-store';
import { AgentActions, LAST_AGENT_ACTION } from '../persistence-store/constants';
import { clearProfiles } from '../profiles';
import { getSettings } from '../settings/settings-store';
import { clearSuites } from '../suites';
import { createAndSaveToken, isValidToken } from '../token';
import { isUserSignedIn, setIsUserSignedIn } from '../user-signed-in-status';

import {
  initAgentProcess,
  isAgentProcessAlive,
  sendToAgentProcess,
  terminateAgentProcess,
} from './agent-process-manager';
import { agentStatusManager } from './agent-status-manager';
import { getOrCreateToken } from './agent-token-manager';

export const disconnectAgent = (): void => {
  sendToAgentProcess({ type: AGENT_DISCONNECT });
};

const connectAgent = async (): Promise<void> => {
  if (!isUserSignedIn()) {
    log.info('User is not signed in, cannot start agent.');
    agentStatusManager.setStatus(AgentStatus.DISCONNECTED);
    return;
  }

  agentStatusManager.setStatus(AgentStatus.CONNECTING);

  const token = await getOrCreateToken();
  if (!isValidToken(token)) {
    log.info('Missing or invalid token, cannot start agent.');
    agentStatusManager.setStatus(AgentStatus.DISCONNECTED);
    return;
  }

  if (!isAgentProcessAlive()) {
    initAgentProcess();
  }

  sendToAgentProcess({
    data: { token: token.token },
    type: AGENT_CONNECT,
  });
};

export const restartAgent = async (): Promise<void> => {
  log.info('Restarting agent');
  agentStatusManager.setStatus(AgentStatus.RESTARTING);

  try {
    disconnectAgent();
    await terminateAgentProcess();
  } catch (error) {
    log.warn('Terminate Agent encountered an error, but proceeding with restart.', error);
  }

  if (get<string>(LAST_AGENT_ACTION) === AgentActions.STOP) {
    agentStatusManager.setStatus(AgentStatus.DISCONNECTED);
    log.info('Agent was manually stopped. Skipping auto-start.');
    return;
  }

  log.info('Attempting to start a new agent process');
  await connectAgent();
};

export const subscribeToAgentEventsFromRenderer = (): void => {
  subscribeToUserIsSignedInFromRenderer();
  subscribeToStartAgentFromRenderer();
  subscribeToStopAgentFromRenderer();
};

export const subscribeToAgentStatusChanges = (): void => {
  agentStatusManager.onStatusChange((newStatus, oldStatus) => {
    log.info('Agent status changed', { from: oldStatus, to: newStatus });

    if (newStatus === AgentStatus.INVALID_TOKEN) {
      handleInvalidToken();
    }

    if (newStatus === AgentStatus.OUTDATED) {
      handleOutdatedAgent();
    }
  });
};

const handleInvalidToken = async (): Promise<void> => {
  log.info('Invalid token detected, fetching new token from Loadmill server');

  const token = await createAndSaveToken();
  if (!isValidToken(token)) {
    log.error('Failed to fetch new token, cannot reconnect agent');
    agentStatusManager.setStatus(AgentStatus.ERROR);
    return;
  }

  log.info('New token fetched, reconnecting agent');
  sendToAgentProcess({
    data: { token: token.token },
    type: AGENT_CONNECT,
  });
};

const handleOutdatedAgent = (): void => {
  log.info('Outdated agent detected, disconnecting agent');
  disconnectAgent();

  if (getSettings()?.autoUpdate === false) {
    log.info('Auto update is disabled, marking agent as stopped');
    set(LAST_AGENT_ACTION, AgentActions.STOP);
  }
};

const subscribeToUserIsSignedInFromRenderer = () => {
  subscribeToMainProcessMessage(SET_IS_USER_SIGNED_IN, handleSetIsUserSignedInEvent);
};

const handleSetIsUserSignedInEvent = async (_event: Electron.IpcMainEvent, { isSignedIn }: MainMessage['data']) => {
  log.info(`Got ${SET_IS_USER_SIGNED_IN} event`, { isSignedIn });
  const isAlreadySignedIn = isUserSignedIn() === isSignedIn;
  if (isAlreadySignedIn) {
    log.info('User signed-in status is already set to the same value, ignoring.');
    return;
  }
  setIsUserSignedIn(isSignedIn);
  if (isUserSignedIn()) {
    await handleUserIsSignedIn();
  } else {
    handleUserIsSignedOut();
  }
};

const handleUserIsSignedIn = async () => {
  ipcMain.emit(FETCH_SUITES);
  ipcMain.emit(FETCH_PROFILES);

  if (
    agentStatusManager.isConnected() ||
    get<string>(LAST_AGENT_ACTION) === AgentActions.STOP
  ) {
    return;
  }

  await connectAgent();
};

const handleUserIsSignedOut = () => {
  clearSuites();
  clearProfiles();
  if (agentStatusManager.isConnected()) {
    log.info('Agent is connected, disconnecting agent...');
    disconnectAgent();
  }
};

const subscribeToStartAgentFromRenderer = () => {
  subscribeToMainProcessMessage(START_AGENT, handleStartAgentEvent);
};

const handleStartAgentEvent = async () => {
  log.info(`Got ${START_AGENT} event`);
  set(LAST_AGENT_ACTION, AgentActions.START);

  if (agentStatusManager.isConnected()) {
    log.warn('Agent is already connected');
    return;
  }

  await connectAgent();
};

const subscribeToStopAgentFromRenderer = () => {
  subscribeToMainProcessMessage(STOP_AGENT, handleStopAgentEvent);
};

const handleStopAgentEvent = () => {
  log.info(`Got ${STOP_AGENT} event`);

  if (!agentStatusManager.isConnected()) {
    log.warn('Agent is not connected');
    return;
  }

  agentStatusManager.setStatus(AgentStatus.DISCONNECTING);
  disconnectAgent();
  set(LAST_AGENT_ACTION, AgentActions.STOP);
};
