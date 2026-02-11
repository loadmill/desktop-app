import { Readable } from 'stream';

import {
  sendFromAgentViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../../log';
import { DATA, STDERR, STDOUT } from '../../universal/constants';

import { parseAgentLog } from './agent-log-parser';
import { agentLogger } from './agent-logger';
import { agentStatusManager } from './agent-status-manager';

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

  // Parse log and update status manager
  const { status, reason } = parseAgentLog(text);
  if (status) {
    log.info('Status change detected from log', { reason, status });
    agentStatusManager.setStatus(status);
  }

  // Forward log to UI and file logger
  sendFromAgentViewToRenderer({ data: { text }, type });
  agentLogger.info(text);
};
