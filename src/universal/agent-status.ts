export enum AgentStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
  INVALID_TOKEN = 'invalid_token',
  OUTDATED = 'outdated',
  RESTARTING = 'restarting',
}

export const isTransitioning = (status: AgentStatus): boolean => {
  return (
    status === AgentStatus.CONNECTING ||
    status === AgentStatus.DISCONNECTING ||
    status === AgentStatus.RESTARTING
  );
};
