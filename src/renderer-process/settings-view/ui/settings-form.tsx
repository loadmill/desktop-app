import {
  Divider,
} from '@mui/material';
import React from 'react';

import {
  ChangedSetting,
  ProxySettings,
} from '../../../types/settings';

import { AgentUrlSettingForm } from './agent-url-setting-form';
import { AutoUpdateSettingForm } from './auto-update-setting-form';
import { OnPremSettingForm } from './on-prem-setting-form';
import { ProxySettingForm } from './proxy-settings-form';

export const SettingsForm = ({
  agentUrl,
  autoUpdate,
  onPremURL,
  onSave,
  proxySettings,
  setAgentUrl,
  setAutoUpdate,
  setOnPremURL,
}: SettingsFormProps): JSX.Element => {

  return (
    <form
      autoComplete='off'
      noValidate
    >
      <ProxySettingForm
        onSave={ onSave }
        proxySettings={ proxySettings }
      />
      <Divider />
      <AutoUpdateSettingForm
        autoUpdate={ autoUpdate }
        onSave={ onSave }
        setAutoUpdate={ setAutoUpdate }
      />
      <Divider />
      <OnPremSettingForm
        onPremURL={ onPremURL }
        onSave={ onSave }
        setOnPremURL={ setOnPremURL }
      />
      <Divider />
      <AgentUrlSettingForm
        agentUrl={ agentUrl }
        onSave={ onSave }
        setAgentUrl={ setAgentUrl }
      />
    </form>
  );
};

export type SettingsFormProps = {
  agentUrl: string;
  autoUpdate: boolean;
  onPremURL: string;
  onSave: (changedSetting: ChangedSetting) => void;
  proxySettings: ProxySettings;
  setAgentUrl: (agentUrl: string) => void;
  setAutoUpdate: (autoUpdate: boolean) => void;
  setOnPremURL: (onPremURL: string) => void;
};
