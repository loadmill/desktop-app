import { parseAgentLog } from '../../../src/main-process/agent/agent-log-parser';
import { AgentStatus } from '../../../src/universal/agent-status';

describe('parseAgentLog', () => {
  describe('Invalid token detection', () => {
    test('should return INVALID_TOKEN status when log contains "Invalid token"', () => {
      const result = parseAgentLog('Invalid token');
      expect(result.status).toBe(AgentStatus.INVALID_TOKEN);
      expect(result.reason).toBe('Invalid token detected');
    });

    test('should detect invalid token in multiline log', () => {
      const log = 'Starting agent...\nInvalid token\nShutting down';
      const result = parseAgentLog(log);
      expect(result.status).toBe(AgentStatus.INVALID_TOKEN);
    });
  });

  describe('Connected detection', () => {
    test('should return CONNECTED status when log contains "Successfully connected to Loadmill"', () => {
      const result = parseAgentLog('Successfully connected to Loadmill');
      expect(result.status).toBe(AgentStatus.CONNECTED);
      expect(result.reason).toBe('Connected to Loadmill');
    });

    test('should detect connection in multiline log', () => {
      const log = 'Initializing...\nSuccessfully connected to Loadmill\nReady';
      const result = parseAgentLog(log);
      expect(result.status).toBe(AgentStatus.CONNECTED);
    });
  });

  describe('Outdated detection', () => {
    test('should return OUTDATED status when log contains "The agent is outdated"', () => {
      const result = parseAgentLog('The agent is outdated');
      expect(result.status).toBe(AgentStatus.OUTDATED);
      expect(result.reason).toBe('Agent version is outdated');
    });

    test('should detect outdated in multiline log', () => {
      const log = 'Checking version...\nThe agent is outdated\nPlease update';
      const result = parseAgentLog(log);
      expect(result.status).toBe(AgentStatus.OUTDATED);
    });
  });

  describe('Disconnected detection', () => {
    test('should return DISCONNECTED status for "Shutting down gracefully"', () => {
      const result = parseAgentLog('Shutting down gracefully');
      expect(result.status).toBe(AgentStatus.DISCONNECTED);
      expect(result.reason).toBe('Disconnected from server');
    });

    test('should return DISCONNECTED status for "Disconnected from Loadmill"', () => {
      const result = parseAgentLog('Disconnected from Loadmill');
      expect(result.status).toBe(AgentStatus.DISCONNECTED);
      expect(result.reason).toBe('Disconnected from server');
    });

    test('should return DISCONNECTED status for "Agent disconnected from server"', () => {
      const result = parseAgentLog('Agent disconnected from server');
      expect(result.status).toBe(AgentStatus.DISCONNECTED);
      expect(result.reason).toBe('Disconnected from server');
    });

    test('should detect disconnect pattern in multiline log', () => {
      const log = 'Processing...\nShutting down gracefully\nGoodbye';
      const result = parseAgentLog(log);
      expect(result.status).toBe(AgentStatus.DISCONNECTED);
    });
  });

  describe('No matching pattern', () => {
    test('should return null status for empty string', () => {
      const result = parseAgentLog('');
      expect(result.status).toBeNull();
      expect(result.reason).toBeUndefined();
    });

    test('should return null status for unrecognized log', () => {
      const result = parseAgentLog('Some random log message');
      expect(result.status).toBeNull();
    });

    test('should return null status for whitespace-only string', () => {
      const result = parseAgentLog('   \n\n   ');
      expect(result.status).toBeNull();
    });
  });
});
