import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { ChangedSetting, ProxySettings } from '../../../types/settings';

import { SettingTitle } from './setting-title';

export const ProxySettingForm = ({
  onSave,
  proxySettings,
}: ProxySettingsFormProps): JSX.Element => {
  const [enabled, setEnabled] = useState<boolean>(!!proxySettings?.enabled);
  const [url, setUrl] = useState<string>(proxySettings?.url || '');
  const [urlError, setUrlError] = useState<string>('');

  const validateUrl = (url: string): boolean => {
    if (url === '') {
      setUrlError('');
      return true;
    } else {
      try {
        new URL(url);
        setUrlError('');
        return true;
      } catch (error) {
        setUrlError('Invalid URL. Ensure it includes a scheme (e.g., \'http://\' or \'https://\'));');
      }
    }
  };

  const onEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setEnabled(value);
    onSave({ name: 'proxy', value: { enabled: value, url } });
  };

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isValid = validateUrl(value);
    setUrl(value);
    if (isValid) {
      onSave({ name: 'proxy', value: { enabled, url: value } });
    }
  };

  return (
    <Box mb={ 4 }>
      <SettingTitle title='Proxy Settings' />
      <FormControlLabel
        control={
          <Checkbox
            checked={ enabled }
            onChange={ onEnabledChange }
          />
        }
        label='Enable Proxy'
      />
      <TextField
        error={ !!urlError }
        fullWidth
        helperText={ urlError }
        label='Proxy URL'
        margin='normal'
        onChange={ onUrlChange }
        value={ url }
      />
    </Box>
  );
};

export type ProxySettingsFormProps = {
  onSave: (changedSetting: ChangedSetting) => void;
  proxySettings: ProxySettings;
};
