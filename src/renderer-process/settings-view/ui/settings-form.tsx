import {
  Divider,
} from '@mui/material';
import React from 'react';

import {
  ChangedSetting,
  ProxySettings,
} from '../../../types/settings';

import { AutoUpdateSettingForm } from './auto-update-setting-form';
import { OnPremSettingForm } from './on-prem-setting-form';
import { ProxySettingForm } from './proxy-settings-form';

export const SettingsForm = ({
  autoUpdate,
  onPremURL,
  onSave,
  proxySettings,
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
    </form>
  );
};

export type SettingsFormProps = {
  autoUpdate: boolean;
  onPremURL: string;
  onSave: (changedSetting: ChangedSetting) => void;
  proxySettings: ProxySettings;
  setAutoUpdate: (autoUpdate: boolean) => void;
  setOnPremURL: (onPremURL: string) => void;
};
