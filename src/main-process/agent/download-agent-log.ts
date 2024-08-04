import path from 'path';

import { shell } from 'electron';

import { DOWNLOADS_PATH } from '../../downloads/constants';
import {
  DOWNLOAD_AGENT_LOG,
} from '../../universal/constants';
import { copyFile } from '../copy-file';
import { subscribeToMainProcessMessage } from '../main-events';

import { agentLoggerFilePath } from './agent-logger';

const AGENT_LOG_FILENAME = 'loadmill-private-agent.log';
export const agentLogDownloadLocation = path.join(DOWNLOADS_PATH, AGENT_LOG_FILENAME);

export const subscribeToDownloadAgentLog = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_AGENT_LOG, downloadAgentLog);
};

const downloadAgentLog = (): void => {
  copyFile(agentLoggerFilePath, agentLogDownloadLocation, () => {
    shell.showItemInFolder(agentLogDownloadLocation);
  });
};
