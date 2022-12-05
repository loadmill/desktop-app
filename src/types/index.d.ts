export { };

declare global {
  interface Window {
    api: {
      checkForUpdates: (msg?: string) => void;
      initAgentLog: (msg?: string) => void;
      isAgentConnected: (msg?: string) => void;
      startAgent: (msg: string) => void;
      stopAgent: (msg?: string) => void;
    }
  }
}
