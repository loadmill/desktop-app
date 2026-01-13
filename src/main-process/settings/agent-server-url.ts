import { getSettings } from './settings-store';

/**
 * Gets the Loadmill Agent Server URL in order of precedence:
 * 1. agentUrl setting (if set, takes precedence)
 * 2. onPremURL setting (if set)
 * 3. LOADMILL_AGENT_SERVER_URL environment variable
 */
export const getLoadmillAgentServerUrl = (): string | undefined => {
  const settings = getSettings();

  if (settings?.agentUrl) {
    return settings.agentUrl;
  }

  if (settings?.onPremURL) {
    return settings.onPremURL;
  }

  return process.env.LOADMILL_AGENT_SERVER_URL;
};
