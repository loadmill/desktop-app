import { Readable } from 'stream';

import {
  sendFromAgentViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { DATA, STDERR, STDOUT } from '../../universal/constants';

import {
  hasInvalidTokenError,
  hasOutdatedAgentError,
  parseAgentLog,
} from './agent-log-parser';
import { agentLogger } from './agent-logger';
import { agentStatusManager } from './agent-status-manager';

/**
 * AgentLogProcessor - Processes stdout/stderr from agent process
 *
 * Responsibilities:
 * - Piping agent logs to handlers
 * - Parsing logs for status changes
 * - Detecting special errors
 * - Forwarding logs to UI and file logger
 * - Delegating error handling to AgentIPCHandlers
 *
 * This module is an EVENT HANDLER - it reacts to logs but delegates
 * business logic decisions to the appropriate orchestrator.
 */

// Callbacks to business logic layer (AgentIPCHandlers)
type InvalidTokenHandler = () => Promise<void>;
type OutdatedAgentHandler = () => void;

let handleInvalidTokenCallback: InvalidTokenHandler | null = null;
let handleOutdatedAgentCallback: OutdatedAgentHandler | null = null;

/**
 * Initialize the log processor with callbacks to business logic handlers
 * Must be called before using the log processor
 */
export function initializeLogProcessor(
  handleInvalidToken: InvalidTokenHandler,
  handleOutdatedAgent: OutdatedAgentHandler,
): void {
  handleInvalidTokenCallback = handleInvalidToken;
  handleOutdatedAgentCallback = handleOutdatedAgent;
  log.info('Agent log processor initialized');
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

  // 1. Check for special errors and delegate to business logic
  if (hasInvalidTokenError(text)) {
    if (handleInvalidTokenCallback) {
      await handleInvalidTokenCallback();
    } else {
      log.error('Invalid token detected but no handler registered');
    }
  }

  if (hasOutdatedAgentError(text)) {
    if (handleOutdatedAgentCallback) {
      handleOutdatedAgentCallback();
    } else {
      log.error('Outdated agent detected but no handler registered');
    }
  }

  // 2. Parse log for status changes
  const { status, reason } = parseAgentLog(text);
  if (status) {
    log.info('Status change detected from log', { reason, status });
    agentStatusManager.setStatus(status);
  }

  // 3. Forward log to UI and file logger
  sendFromAgentViewToRenderer({ data: { text }, type });
  agentLogger.info(text);
};
