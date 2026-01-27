import { ChildProcessWithoutNullStreams } from 'child_process';

import log from '../../log';
import { AgentStatus } from '../../types/agent-status';
import { set } from '../persistence-store';
import { AgentActions, LAST_AGENT_ACTION } from '../persistence-store/constants';

import { agentStatusManager } from './agent-status-manager';

/**
 * AgentProcessEvents - Handles events from the agent child process
 *
 * Responsibilities:
 * - Listening to process exit events
 * - Handling IPC messages from agent process
 * - Updating status based on process state
 */

const isAgentKilledExternally = (exitCode: number | null) => exitCode === null;
const isAgentDisconnected = (exitCode: number | null) => exitCode === 0;

/**
 * Add listener for agent process exit
 */
export const addOnAgentExitEvent = (agent: ChildProcessWithoutNullStreams): void => {
  agent.on('exit', (code, signal) => {
    if (isAgentKilledExternally(code)) {
      log.info('Agent process killed with signal:', signal);
      return;
    }

    log.info('Agent process exited with code:', code);

    if (isAgentDisconnected(code)) {
      set(LAST_AGENT_ACTION, AgentActions.STOPPED);
      agentStatusManager.setStatus(AgentStatus.DISCONNECTED);
    } else {
      // Non-zero exit code = unexpected termination
      log.error('Agent process crashed with exit code:', code);
      agentStatusManager.setStatus(AgentStatus.ERROR);
    }
  });
};
