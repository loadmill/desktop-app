import { Readable } from 'stream';

import {
  sendFromAgentViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { AgentStatus } from '../../types/agent-status';
import { AgentMessage } from '../../types/messaging';
import { DATA, START_AGENT, STDERR, STDOUT } from '../../universal/constants';
import { agentLogger } from '../agent/agent-logger';
import { set } from '../persistence-store';
import { AgentActions, LAST_AGENT_ACTION } from '../persistence-store/constants';
import { getSettings } from '../settings/settings-store';
import { createAndSaveToken } from '../token';

import {
  hasInvalidTokenError,
  hasOutdatedAgentError,
  parseAgentLog,
} from './agent-log-parser';
import { agentStatusManager } from './agent-status-manager';
import { notifyAgentOutdated } from './agent-status-notifier';

/**
 * AgentLogProcessor - Processes stdout/stderr from agent process
 *
 * Responsibilities:
 * - Piping agent logs to handlers
 * - Parsing logs for status changes
 * - Handling special errors (invalid token, outdated agent)
 * - Forwarding logs to UI and file logger
 */

// Module-level dependency injection point
let sendToAgentProcessFn: ((msg: AgentMessage) => void) | null = null;
let stopAgentFn: (() => void) | null = null;

/**
 * Initialize the log processor with dependencies
 * Must be called before using the log processor
 */
export function initializeLogProcessor(
  sendToAgentProcess: (msg: AgentMessage) => void,
  stopAgent: () => void,
): void {
  sendToAgentProcessFn = sendToAgentProcess;
  stopAgentFn = stopAgent;
}

/**
 * Pipe stdout from agent process
 */
export const pipeAgentStdout = (stdout: Readable): void => {
  stdout.on(DATA, async (data: string | Buffer) => {
    await handleAgentStd(data, STDOUT);
  });
};

/**
 * Pipe stderr from agent process
 */
export const pipeAgentStderr = (stderr: Readable): void => {
  stderr.on(DATA, async (data: string | Buffer) => {
    await handleAgentStd(data, STDERR);
  });
};

// ============================================================================
// Private Functions
// ============================================================================

const handleAgentStd = async (
  data: string | Buffer,
  type: typeof STDOUT | typeof STDERR,
) => {
  const text = data.toString();
  log.info('Agent:', text);

  // Handle special error cases first
  await handleInvalidToken(text);
  handleAgentOutdated(text);

  // Parse log for status changes
  const { reason, status } = parseAgentLog(text);
  if (status) {
    log.info('Status change detected from log', { reason, status });
    agentStatusManager.setStatus(status);
  }

  // Send log to UI and file logger
  sendFromAgentViewToRenderer({ data: { text }, type });
  agentLogger.info(text);
};

const handleAgentOutdated = (text: string) => {
  if (!stopAgentFn) {
    log.error('stopAgentFn not initialized in log processor');
    return;
  }

  if (hasOutdatedAgentError(text)) {
    log.info('Got outdated agent message, stopping agent');
    stopAgentFn();
    agentStatusManager.setStatus(AgentStatus.OUTDATED);
    notifyAgentOutdated();

    if (getSettings()?.autoUpdate === false) {
      log.info('Auto update is disabled, storing LAST_AGENT_ACTION as STOPPED');
      set(LAST_AGENT_ACTION, AgentActions.STOPPED);
    }
  }
};

const handleInvalidToken = async (text: string) => {
  if (!sendToAgentProcessFn) {
    log.error('sendToAgentProcessFn not initialized in log processor');
    return;
  }

  if (hasInvalidTokenError(text)) {
    log.info('Got Invalid token from agent, fetching new token from loadmill server');
    const token = await createAndSaveToken();
    if (!token) {
      log.error('Token still does not exists / not valid, could not connect the agent');
      return;
    }

    sendToAgentProcessFn({
      data: { token: token.token },
      type: START_AGENT,
    });
  }
};
