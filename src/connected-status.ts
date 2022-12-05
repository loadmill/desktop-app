import { IS_AGENT_CONNECTED } from './constants';
import { send as sendToRenderer } from './main-to-renderer';
import { ProcessMessageRenderer } from './types/messaging';
import { checkForUpdates } from './updates';
import { textToNonEmptyLines } from './utils';

let _isConnected = false;

const updateConnectedStatus = ({ isConnected, text }: ProcessMessageRenderer['data']): void => {
  if (text) {
    handleText(text);
  }
  if (isConnected != null) {
    _isConnected = isConnected;
  }
};

export const refreshConnectedStatus = (data: ProcessMessageRenderer['data']): void => {
  updateConnectedStatus(data);
  sendToRenderer({
    data: { isConnected: _isConnected },
    type: IS_AGENT_CONNECTED,
  });
};

const handleText = (text: string) => {
  const lines = textToNonEmptyLines(text);
  if (lines.some(l => l.includes('[INFO] Successfully connected to Loadmill'))) {
    _isConnected = true;
  }
  if (lines.some(l => l.includes('[INFO] Shutting down gracefully')) ||
    lines.some(l => l.includes('[ERROR] Disconnected from Loadmill'))) {
    _isConnected = false;
  }
  if (lines.some(l => l.includes('[ERROR] The agent is outdated'))) {
    _isConnected = false;
    checkForUpdates();
  }
};
