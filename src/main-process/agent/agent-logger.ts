import log, { createLogger } from '../../log';

const AGENT_LOG_FILENAME = 'agent.log';
const AGENT_LOGGER_NAME = 'agent-logger';

export const agentLogger = createLogger(
  AGENT_LOGGER_NAME,
  AGENT_LOG_FILENAME,
  'info',
  false,
);

log.info(
  'Agent logger created. Writing to file: ',
  agentLogger.filePath,
);

export const agentLoggerFilePath = agentLogger.filePath;
