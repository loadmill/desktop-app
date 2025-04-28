import { app } from 'electron';

import log from '../log';

import { killAgentProcess } from './agent-handlers';

export const relaunchDesktopApp = (): void => {
  log.info('Relaunching desktop app...');
  app.relaunch({
    args: process.argv.slice(1),
  });
  killAgentProcess();
  app.exit(0);
};
