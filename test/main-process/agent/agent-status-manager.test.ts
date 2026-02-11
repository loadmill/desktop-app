import { agentStatusManager } from '../../../src/main-process/agent/agent-status-manager';
import { AgentStatus } from '../../../src/universal/agent-status';

const AGENT_STATUS_TIMEOUT_MS = 25_000;

jest.useFakeTimers({ legacyFakeTimers: true });

const resetToInitialState = (): void => {
  agentStatusManager.clearStatusTimeout();
  agentStatusManager.setStatus(AgentStatus.DISCONNECTED);
  jest.clearAllTimers();
};

describe('AgentStatusManager initial state', () => {
  test('should have DISCONNECTED as initial status', () => {
    expect(agentStatusManager.getStatus()).toBe(AgentStatus.DISCONNECTED);
  });
});

describe('AgentStatusManager', () => {
  beforeEach(() => {
    resetToInitialState();
  });

  describe('getStatus', () => {
    test('should return current status after setStatus', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);
      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTING);
    });
  });

  describe('isConnected', () => {
    test('should return false when status is DISCONNECTED', () => {
      expect(agentStatusManager.isConnected()).toBe(false);
    });

    test('should return true when status is CONNECTED', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTED);
      expect(agentStatusManager.isConnected()).toBe(true);
    });

    test('should return false when status is CONNECTING', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);
      expect(agentStatusManager.isConnected()).toBe(false);
    });

    test('should return false when status is ERROR', () => {
      agentStatusManager.setStatus(AgentStatus.ERROR);
      expect(agentStatusManager.isConnected()).toBe(false);
    });
  });

  describe('setStatus', () => {
    test('should update status', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);
      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTING);
    });

    test('should not notify callback when setting same status', () => {
      agentStatusManager.setStatus(AgentStatus.DISCONNECTED);

      const callback = jest.fn();
      agentStatusManager.onStatusChange(callback);

      agentStatusManager.setStatus(AgentStatus.DISCONNECTED);

      expect(callback).not.toHaveBeenCalled();
    });

    test('should transition through multiple states', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);
      agentStatusManager.setStatus(AgentStatus.CONNECTED);
      agentStatusManager.setStatus(AgentStatus.DISCONNECTING);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.DISCONNECTING);
    });
  });

  describe('onStatusChange', () => {
    test('should call registered callback on status change', () => {
      const callback = jest.fn();
      agentStatusManager.onStatusChange(callback);

      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      expect(callback).toHaveBeenCalledWith(
        AgentStatus.CONNECTING,
        AgentStatus.DISCONNECTED,
      );
    });

    test('should call multiple callbacks on status change', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      agentStatusManager.onStatusChange(callback1);
      agentStatusManager.onStatusChange(callback2);

      agentStatusManager.setStatus(AgentStatus.CONNECTED);

      expect(callback1).toHaveBeenCalledWith(
        AgentStatus.CONNECTED,
        AgentStatus.DISCONNECTED,
      );
      expect(callback2).toHaveBeenCalledWith(
        AgentStatus.CONNECTED,
        AgentStatus.DISCONNECTED,
      );
    });

    test('should return unsubscribe function that removes callback', () => {
      const callback = jest.fn();
      const unsubscribe = agentStatusManager.onStatusChange(callback);

      agentStatusManager.setStatus(AgentStatus.CONNECTING);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      agentStatusManager.setStatus(AgentStatus.CONNECTED);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    test('should handle callback errors without breaking other callbacks', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      agentStatusManager.onStatusChange(errorCallback);
      agentStatusManager.onStatusChange(normalCallback);

      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('timeout behavior', () => {
    test('should set timeout for CONNECTING status', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTING);

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.ERROR);
    });

    test('should set timeout for DISCONNECTING status', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTED);
      agentStatusManager.setStatus(AgentStatus.DISCONNECTING);

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.ERROR);
    });

    test('should set timeout for RESTARTING status', () => {
      agentStatusManager.setStatus(AgentStatus.RESTARTING);

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.ERROR);
    });

    test('should not set timeout for non-transitioning status CONNECTED', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTED);

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTED);
    });

    test('should not set timeout for non-transitioning status ERROR', () => {
      agentStatusManager.setStatus(AgentStatus.ERROR);

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.ERROR);
    });

    test('should clear timeout when transitioning to non-transitioning state', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      // Advance halfway through timeout
      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS / 2);

      // Transition to connected (non-transitioning)
      agentStatusManager.setStatus(AgentStatus.CONNECTED);

      // Advance past original timeout
      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      // Should still be connected, not error
      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTED);
    });

    test('should reset timeout when transitioning between transitioning states', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      // Advance close to timeout
      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS - 1000);

      // Transition to restarting (also transitioning)
      agentStatusManager.setStatus(AgentStatus.RESTARTING);

      // Advance past original timeout but not new timeout
      jest.advanceTimersByTime(2000);

      // Should still be restarting
      expect(agentStatusManager.getStatus()).toBe(AgentStatus.RESTARTING);

      // Now advance past the new timeout
      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      expect(agentStatusManager.getStatus()).toBe(AgentStatus.ERROR);
    });
  });

  describe('clearStatusTimeout', () => {
    test('should clear pending timeout', () => {
      agentStatusManager.setStatus(AgentStatus.CONNECTING);

      agentStatusManager.clearStatusTimeout();

      jest.advanceTimersByTime(AGENT_STATUS_TIMEOUT_MS);

      // Should still be connecting since timeout was cleared
      expect(agentStatusManager.getStatus()).toBe(AgentStatus.CONNECTING);
    });

    test('should be safe to call when no timeout is set', () => {
      expect(() => agentStatusManager.clearStatusTimeout()).not.toThrow();
    });
  });
});
