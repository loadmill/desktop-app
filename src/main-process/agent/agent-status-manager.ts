import log from '../../log';
import { AgentStatus } from '../../types/agent-status';

/**
 * AgentStatusManager - Single source of truth for agent status
 *
 * This class manages the current status of the agent process and connection.
 * All status queries and updates should go through this manager.
 *
 * Status meanings:
 * - CONNECTED: Process is alive and connected to Loadmill server
 * - DISCONNECTED: Process is alive but not connected to server
 * - CONNECTING: Attempting to establish connection
 * - DISCONNECTING: Gracefully shutting down connection
 * - RESTARTING: Process is being restarted
 * - ERROR: Unexpected state or timeout occurred
 * - OUTDATED: Agent version is outdated and needs update
 */

type StatusChangeCallback = (newStatus: AgentStatus, oldStatus: AgentStatus) => void;

const AGENT_STATUS_TIMEOUT_MS = 25_000;

class AgentStatusManager {
  private currentStatus: AgentStatus = AgentStatus.DISCONNECTED;
  private statusTimeout: NodeJS.Timeout | null = null;
  private callbacks: StatusChangeCallback[] = [];
  private lastTransitionTime: number = Date.now();

  /**
   * Get the current agent status
   */
  getStatus(): AgentStatus {
    return this.currentStatus;
  }

  /**
   * Convenience method - returns true if agent is connected to Loadmill server
   */
  isConnected(): boolean {
    return this.currentStatus === AgentStatus.CONNECTED;
  }

  /**
   * Convenience method - returns true if agent is in a transitional state
   */
  isTransitioning(): boolean {
    return this.isTransitionalStatus(this.currentStatus);
  }

  /**
   * Convenience method - returns true if in CONNECTING or RESTARTING state
   */
  isPendingConnectOrRestart(): boolean {
    return (
      this.currentStatus === AgentStatus.CONNECTING ||
      this.currentStatus === AgentStatus.RESTARTING
    );
  }

  /**
   * Set the agent status. This is the primary way to update status.
   * Triggers callbacks and manages timeouts for transitional states.
   */
  setStatus(newStatus: AgentStatus): void {
    const oldStatus = this.currentStatus;

    if (oldStatus === newStatus) {
      return; // No change
    }

    // Log transition
    const timeSinceLastTransition = Date.now() - this.lastTransitionTime;
    log.info('Agent status transition', {
      from: oldStatus,
      timeSinceLastMs: timeSinceLastTransition,
      to: newStatus,
    });

    // Warn on rapid transitions (potential race condition)
    if (timeSinceLastTransition < 1000) {
      log.warn('Rapid status transition detected', {
        from: oldStatus,
        intervalMs: timeSinceLastTransition,
        to: newStatus,
      });
    }

    // Update state
    this.currentStatus = newStatus;
    this.lastTransitionTime = Date.now();

    // Manage timeout for transitional states
    this.manageTimeout(newStatus);

    // Notify observers
    this.notifyCallbacks(newStatus, oldStatus);
  }

  /**
   * Register a callback to be notified on status changes
   * Returns an unsubscribe function
   */
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Recover from ERROR state back to DISCONNECTED
   * This allows the normal connection logic to retry
   */
  recover(): void {
    if (this.currentStatus === AgentStatus.ERROR) {
      log.info('Recovering from ERROR state');
      this.setStatus(AgentStatus.DISCONNECTED);
    }
  }

  /**
   * Force clear any pending timeouts (useful for cleanup)
   */
  clearTimeout(): void {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
  }

  /**
   * Get diagnostic information (useful for debugging)
   */
  getDiagnostics() {
    return {
      callbackCount: this.callbacks.length,
      currentStatus: this.currentStatus,
      hasTimeout: !!this.statusTimeout,
      lastTransitionTime: this.lastTransitionTime,
      timeSinceLastTransition: Date.now() - this.lastTransitionTime,
    };
  }

  private isTransitionalStatus(status: AgentStatus): boolean {
    return [
      AgentStatus.CONNECTING,
      AgentStatus.DISCONNECTING,
      AgentStatus.RESTARTING,
    ].includes(status);
  }

  private manageTimeout(status: AgentStatus): void {
    // Clear any existing timeout
    this.clearTimeout();

    // Set timeout only for transitional states
    if (!this.isTransitionalStatus(status)) {
      return;
    }

    this.statusTimeout = setTimeout(() => {
      log.warn('Timed out waiting for agent state transition', {
        status: this.currentStatus,
        timeoutMs: AGENT_STATUS_TIMEOUT_MS,
      });
      this.setStatus(AgentStatus.ERROR);
    }, AGENT_STATUS_TIMEOUT_MS);
  }

  private notifyCallbacks(newStatus: AgentStatus, oldStatus: AgentStatus): void {
    // Fire-and-forget: callbacks handle their own errors
    for (const callback of this.callbacks) {
      try {
        callback(newStatus, oldStatus);
      } catch (error) {
        log.error('Error in status change callback', error);
      }
    }
  }
}

// Singleton instance
export const agentStatusManager = new AgentStatusManager();
