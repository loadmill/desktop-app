import {
  Box,
  Button,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { ChangedSetting, Settings } from '../../../types/settings';

import { SettingTitle } from './setting-title';

export const UrlSettingForm = ({
  onSave,
  setUrl,
  url,
  title,
  label,
  settingName,
}: UrlSettingFormProps): JSX.Element => {

  const [initialUrl, setInitialUrl] = useState<string>(url);
  const [urlError, setUrlError] = useState<string>('');

  const validateUrl = (urlValue: string): void => {
    if (urlValue === '') {
      setUrlError('');
    } else {
      try {
        new URL(urlValue);
        setUrlError('');
      } catch (error) {
        setUrlError('Invalid URL');
      }
    }
  };

  const isUrlChanged = url !== initialUrl;

  const onUpdateSettingsChange = () => {
    setInitialUrl(url);
    onSave({ name: settingName, value: url });
  };

  return (
    <Box
      mb={ 4 }
      mt={ 4 }
    >
      <SettingTitle title={ title } />
      <TextField
        error={ !!urlError }
        fullWidth
        helperText={ urlError }
        label={ label }
        margin='normal'
        onChange={ (event) => {
          setUrl(event.target.value);
          validateUrl(event.target.value);
        } }
        value={ url }
      />
      <Button
        color='primary'
        disabled={ !!urlError || !isUrlChanged }
        onClick={ onUpdateSettingsChange }
        size='small'
        style={ { marginTop: 8 } }
        variant='contained'
      >
        Save
      </Button>
    </Box>
  );

};

export type UrlSettingFormProps = {
  label: string;
  onSave: (changedSetting: ChangedSetting) => void;
  setUrl: (url: string) => void;
  settingName: keyof Settings;
  title: string;
  url: string;
};
