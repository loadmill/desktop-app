import { shell } from 'electron';

import {
  DOWNLOAD_AGENT_LOG
} from '../../universal/constants';
import {
  AGENT_LOG_SAVE_PATH,
  FULL_AGENT_LOG_PATH,
} from '../constants';
import { copyFile } from '../copy-file';
import { subscribeToMainProcessMessage } from '../main-events';

export const subscribeToDownloadAgentLog = (): void => {
  subscribeToMainProcessMessage(DOWNLOAD_AGENT_LOG, downloadAgentLog);
};

const downloadAgentLog = (): void => {
  copyFile(FULL_AGENT_LOG_PATH, AGENT_LOG_SAVE_PATH, () => {
    shell.showItemInFolder(AGENT_LOG_SAVE_PATH);
  });
};
