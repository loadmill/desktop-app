import { ipcMain } from 'electron';

import log from '../../log';
import { AgentStatus } from '../../types/agent-status';
import { MainMessage } from '../../types/messaging';
import {
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
import { clearSuites } from '../suites';
import { isValidToken } from '../token';
import { isUserSignedIn, setIsUserSignedIn } from '../user-signed-in-status';

import { startAgentProcess, stopAgentProcess, terminateAgentProcess } from './agent-process-manager';
import { agentStatusManager } from './agent-status-manager';
import { getOrCreateToken } from './agent-token-manager';

/**
 * Core agent API (domain-level) - lives in IPC layer.
 *
 * Process details are delegated to agent-process-manager.
 */
export const startAgent = (token: string): void => {
  if (!agentStatusManager.isConnected()) {
    startAgentProcess(token);
    set(LAST_AGENT_ACTION, AgentActions.STARTED);
  }
};

export const stopAgent = (): void => {
  stopAgentProcess();
};

/**
 * Domain-level helper: attempts to start the agent based on current user state.
 * Exported to be reused by restart flows.
 */
export const attemptToStartAgent = async (): Promise<void> => {
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

  startAgent(token.token);
};

/**
 * Domain-level restart orchestration.
 * Process details are delegated to agent-process-manager.
 */
export const restartAgentProcess = async (): Promise<void> => {
  log.info('Restarting agent process');
  agentStatusManager.setStatus(AgentStatus.RESTARTING);

  try {
    stopAgentProcess();
    await terminateAgentProcess();
  } catch (error) {
    log.warn('Terminate Agent encountered an error, but proceeding with restart.', error);
  }

  log.info('Marking agent as disconnected');
  agentStatusManager.setStatus(AgentStatus.DISCONNECTED);

  const lastAgentAction = get<string>(LAST_AGENT_ACTION);
  if (lastAgentAction === AgentActions.STOPPED) {
    log.info('Agent was manually stopped. Skipping auto-start.');
    return;
  }

  log.info('Attempting to start a new agent process');
  await attemptToStartAgent();
};

/**
 * AgentIPCHandlers - Handles IPC messages from the renderer process
 *
 * Responsibilities:
 * - Listening to IPC events from UI
 * - Handling user sign in/out
 * - Starting/stopping agent on user request
 * - Managing agent lifecycle based on user actions
 */

/**
 * Subscribe to all agent-related IPC events from renderer
 */
export const subscribeToAgentEventsFromRenderer = (): void => {
  subscribeToUserIsSignedInFromRenderer();
  subscribeToStartAgentFromRenderer();
  subscribeToStopAgentFromRenderer();
};

// ============================================================================
// User Sign In/Out Handlers
// ============================================================================

const subscribeToUserIsSignedInFromRenderer = () => {
  subscribeToMainProcessMessage(SET_IS_USER_SIGNED_IN, handleSetIsUserSignedInEvent);
};

const handleSetIsUserSignedInEvent = async (_event: Electron.IpcMainEvent, { isSignedIn }: MainMessage['data']) => {
  log.info(`Got ${SET_IS_USER_SIGNED_IN} event`, { isSignedIn });
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

  if (!shouldStartAgent()) {
    return;
  }

  const token = await getOrCreateToken();
  if (!isValidToken(token)) {
    log.info('Token still does not exists / not valid, could not connect the agent');
    return;
  }
  startAgent(token.token);
};

const shouldStartAgent = (): boolean => {
  if (agentStatusManager.isConnected()) {
    return false;
  }

  const lastAgentAction = get<string>(LAST_AGENT_ACTION);
  if (lastAgentAction === AgentActions.STOPPED) {
    return false;
  }
  return true;
};

const handleUserIsSignedOut = () => {
  clearSuites();
  clearProfiles();
  if (agentStatusManager.isConnected()) {
    log.info('Agent is connected, stopping agent...');
    stopAgent();
  }
};

// ============================================================================
// Start Agent Handler
// ============================================================================

const subscribeToStartAgentFromRenderer = () => {
  subscribeToMainProcessMessage(START_AGENT, handleStartAgentEvent);
};

const handleStartAgentEvent = async () => {
  log.info(`Got ${START_AGENT} event`);

  if (agentStatusManager.isConnected()) {
    log.info('Agent is already connected');
    agentStatusManager.setStatus(AgentStatus.CONNECTED); // Trigger notification
    return;
  }

  await attemptToStartAgent();
};

// ============================================================================
// Stop Agent Handler
// ============================================================================

const subscribeToStopAgentFromRenderer = () => {
  subscribeToMainProcessMessage(STOP_AGENT, handleStopAgentEvent);
};

const handleStopAgentEvent = () => {
  log.info(`Got ${STOP_AGENT} event`);

  const currentStatus = agentStatusManager.getStatus();
  if (currentStatus === AgentStatus.DISCONNECTED && !agentStatusManager.isPendingConnectOrRestart()) {
    log.info('Agent is already not connected');
    agentStatusManager.setStatus(AgentStatus.DISCONNECTED); // Trigger notification
    return;
  }

  agentStatusManager.setStatus(AgentStatus.DISCONNECTING);
  stopAgent();
  set(LAST_AGENT_ACTION, AgentActions.STOPPED);
};
