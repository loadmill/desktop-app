/**
 * This module provides a nice interface to send messages from main process to agent view.
 */
import { WebContents } from 'electron';

import log from '../log';
import { AgentRendererMessage } from '../types/messaging';

const MainToAgent = {
  agentWebContents: null as WebContents,
};

export const initMainToAgent = (agentWebContents: WebContents): void => {
  MainToAgent.agentWebContents = agentWebContents;
};

export const sendFromMainToAgent = ({ type, data }: AgentRendererMessage): void => {
  try {
    if (MainToAgent.agentWebContents) {
      log.debug('Sending to agent view', { data, type });
      MainToAgent.agentWebContents.send(type, data);
    } else {
      log.warn('Cannot send from main process to agent view. Reason: No agentView on MainToAgent object.', {
        data,
        type,
      });
    }
  } catch (e) {
    log.error('error in send main to agent', e);
  }
};
