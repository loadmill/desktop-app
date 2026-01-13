import { getSettings } from './settings-store';

export let LOADMILL_WEB_APP_ORIGIN = process.env.LOADMILL_WEB_APP_ORIGIN || 'https://app.loadmill.com';

export const setOnPremURLOnStartup = async (): Promise<void> => {
  const settings = getSettings();
  if (settings?.onPremURL) {
    LOADMILL_WEB_APP_ORIGIN = settings.onPremURL;
  }
};
