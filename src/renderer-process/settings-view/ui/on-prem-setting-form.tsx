import {
  Box,
  Button,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { ChangedSetting } from '../../../types/settings';

import { SettingTitle } from './setting-title';

export const OnPremSettingForm = ({
  onSave,
  setOnPremURL,
  onPremURL,
}: OnPremSettingFormProps): JSX.Element => {

  const [initialOnPremURL] = useState<string>(onPremURL);
  const [urlError, setUrlError] = useState<string>('');

  const validateUrl = (url: string): void => {
    if (url === '') {
      setUrlError('');
    } else {
      try {
        new URL(url);
        setUrlError('');
      } catch (error) {
        setUrlError('Invalid URL');
      }
    }
  };

  const isUrlChanged = onPremURL !== initialOnPremURL;

  const onUpdateSettingsChange = () => {
    onSave({ name: 'onPremURL', value: onPremURL });
  };

  return (
    <Box
      mb={ 4 }
      mt={ 4 }
    >
      <SettingTitle title='Loadmill On Premises URL' />
      <TextField
        error={ !!urlError }
        fullWidth
        helperText={ urlError }
        label='On Premises URL'
        margin='normal'
        onChange={ (event) => {
          setOnPremURL(event.target.value);
          validateUrl(event.target.value);
        } }
        value={ onPremURL }
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

export type OnPremSettingFormProps = {
  onPremURL: string;
  onSave: (changedSetting: ChangedSetting) => void;
  setOnPremURL: (onPremURL: string) => void;
};
