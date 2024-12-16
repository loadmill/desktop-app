import { app } from 'electron';

import log from '../log';

export const relaunchDesktopApp = (): void => {
  log.info('Relaunching desktop app...');
  app.relaunch({
    args: process.argv.slice(1),
  });
  app.exit(0);
};
