import log from '../../log';
import { AgentStatus, isTransitioning } from '../../universal/agent-status';

type StatusChangeCallback = (newStatus: AgentStatus, oldStatus: AgentStatus) => void;

const AGENT_STATUS_TIMEOUT_MS = 25_000;

class AgentStatusManager {
  private currentStatus: AgentStatus = AgentStatus.DISCONNECTED;
  private statusTimeout: NodeJS.Timeout | null = null;
  private callbacks: StatusChangeCallback[] = [];
  private lastTransitionTime: number = Date.now();

  getStatus(): AgentStatus {
    return this.currentStatus;
  }

  isConnected(): boolean {
    return this.currentStatus === AgentStatus.CONNECTED;
  }

  setStatus(newStatus: AgentStatus): void {
    const oldStatus = this.currentStatus;

    if (oldStatus === newStatus) {
      return;
    }

    log.info('Agent status transition', {
      from: oldStatus,
      timeSinceLastMs: Date.now() - this.lastTransitionTime,
      to: newStatus,
    });

    this.currentStatus = newStatus;
    this.lastTransitionTime = Date.now();

    this.manageTimeout(newStatus);

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

  clearStatusTimeout(): void {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
  }

  private manageTimeout(status: AgentStatus): void {
    this.clearStatusTimeout();

    if (!isTransitioning(status)) {
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
    for (const callback of this.callbacks) {
      try {
        callback(newStatus, oldStatus);
      } catch (error) {
        log.error('Error in status change callback', error);
      }
    }
  }
}

export const agentStatusManager = new AgentStatusManager();
