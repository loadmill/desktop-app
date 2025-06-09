
import { getSettings } from './settings-store';

export let LOADMILL_WEB_APP_ORIGIN = process.env.LOADMILL_WEB_APP_ORIGIN || 'https://app.loadmill.com';
export let LOADMILL_AGENT_SERVER_URL = process.env.LOADMILL_AGENT_SERVER_URL;

export const setOnPremURLOnStartup = async (): Promise<void> => {
  const settings = getSettings();
  if (settings?.onPremURL) {
    LOADMILL_WEB_APP_ORIGIN = settings.onPremURL;
    LOADMILL_AGENT_SERVER_URL = settings.onPremURL;
  }
};
