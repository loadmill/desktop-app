import {
  Divider,
} from '@mui/material';
import React from 'react';

import {
  ChangedSetting,
  ProxySettings,
} from '../../../types/settings';

import { AutoUpdateSettingForm } from './auto-update-setting-form';
import { ProxySettingForm } from './proxy-settings-form';

export const SettingsForm = ({
  autoUpdate,
  onSave,
  proxySettings,
  setAutoUpdate,
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
    </form>
  );
};

export type SettingsFormProps = {
  autoUpdate: boolean;
  onSave: (changedSetting: ChangedSetting) => void;
  proxySettings: ProxySettings;
  setAutoUpdate: (autoUpdate: boolean) => void;
};
