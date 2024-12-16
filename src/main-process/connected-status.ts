import { MainMessage } from '../types/messaging';
import { textToNonEmptyLines } from '../universal/utils';

let _isConnected = false;

export const isAgentConnected = (): boolean => _isConnected;

export const refreshConnectedStatus = (data: MainMessage['data']): void => {
  updateConnectedStatus(data);
};

const updateConnectedStatus = ({ isConnected, text }: MainMessage['data']): void => {
  if (text) {
    updateConnectedStatusByText(text);
  }
  if (isConnected != null) {
    _isConnected = isConnected;
  }

};

const updateConnectedStatusByText = (text: string) => {
  const lines = textToNonEmptyLines(text);
  if (lines.some(l => l.includes('[INFO] Successfully connected to Loadmill'))) {
    _isConnected = true;
  }
  if (lines.some(l => l.includes('[INFO] Shutting down gracefully')) ||
    lines.some(l => l.includes('[ERROR] Disconnected from Loadmill')) ||
    lines.some(l => l.includes('[ERROR] The agent is outdated'))
  ) {
    _isConnected = false;
  }
};
