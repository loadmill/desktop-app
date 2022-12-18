import { IS_AGENT_CONNECTED } from './constants';
import { send as sendToRenderer } from './main-to-renderer';
import { updateValidToken } from './token';
import { ProcessMessageRenderer } from './types/messaging';
import { checkForUpdates } from './updates';
import { textToNonEmptyLines } from './utils';

let _isConnected = false;

export const refreshConnectedStatus = (data: ProcessMessageRenderer['data']): void => {
  updateConnectedStatus(data);
  sendToRenderer({
    data: { isConnected: _isConnected },
    type: IS_AGENT_CONNECTED,
  });
};

const updateConnectedStatus = ({ isConnected, text }: ProcessMessageRenderer['data']): void => {
  if (text) {
    handleText(text);
  }
  if (isConnected != null) {
    _isConnected = isConnected;
  }
};

const handleText = (text: string) => {
  const lines = textToNonEmptyLines(text);
  if (lines.some(l => l.includes('[INFO] Successfully connected to Loadmill'))) {
    _isConnected = true;
    updateValidToken();
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
