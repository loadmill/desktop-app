import { getSettings } from './settings-store';

export let LOADMILL_WEB_APP_ORIGIN = process.env.LOADMILL_WEB_APP_ORIGIN || 'https://loadmill-codegen-demo-yms6micl.herokuapp.com';
export let LOADMILL_AGENT_SERVER_URL = process.env.LOADMILL_AGENT_SERVER_URL || 'https://loadmill-codegen-demo-yms6micl.herokuapp.com';

export const setOnPremURLOnStartup = async (): Promise<void> => {
  const settings = getSettings();
  if (settings?.onPremURL) {
    LOADMILL_WEB_APP_ORIGIN = settings.onPremURL;
    LOADMILL_AGENT_SERVER_URL = settings.onPremURL;
  }
};
