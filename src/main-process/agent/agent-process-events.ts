import { ChildProcessWithoutNullStreams } from 'child_process';

import log from '../../log';
import { AgentStatus } from '../../universal/agent-status';
import { set } from '../persistence-store';
import { AgentActions, LAST_AGENT_ACTION } from '../persistence-store/constants';

import { agentStatusManager } from './agent-status-manager';

// Process killed by signal (happens when we relaunch internally)
const isAgentKilledInternally = (exitCode: number | null) => exitCode === null;

// Clean exit with code 0 (happens when stopped from Loadmill UI)
const isAgentKilledExternally = (exitCode: number | null) => exitCode === 0;

/**
 * Add listener for agent process exit
 */
export const addOnAgentExitEvent = (agent: ChildProcessWithoutNullStreams): void => {
  agent.on('exit', (code, signal) => {
    agentStatusManager.setStatus(AgentStatus.DISCONNECTED);

    if (isAgentKilledInternally(code)) {
      log.info('Agent process killed with signal:', signal);
      return;
    }

    log.info('Agent process exited with code:', code);

    if (isAgentKilledExternally(code)) {
      set(LAST_AGENT_ACTION, AgentActions.STOP);
      return;
    }

    log.error('Agent process crashed with exit code:', code);
    agentStatusManager.setStatus(AgentStatus.ERROR);
  });
};
