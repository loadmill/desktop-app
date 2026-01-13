import { getSettings } from './settings-store';

/**
 * Gets the Loadmill Agent Server URL in order of precedence:
 * 1. onPremURL setting (if set, takes precedence)
 * 2. agentUrl setting (if set)
 * 3. LOADMILL_AGENT_SERVER_URL environment variable
 */
export const getLoadmillAgentServerUrl = (): string | undefined => {
  const settings = getSettings();

  if (settings?.onPremURL) {
    return settings.onPremURL;
  }

  if (settings?.agentUrl) {
    return settings.agentUrl;
  }

  return process.env.LOADMILL_AGENT_SERVER_URL;
};
