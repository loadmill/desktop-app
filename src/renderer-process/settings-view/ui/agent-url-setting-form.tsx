import {
  Box,
  Button,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { ChangedSetting } from '../../../types/settings';

import { SettingTitle } from './setting-title';

export const AgentUrlSettingForm = ({
  onSave,
  setAgentUrl,
  agentUrl,
}: AgentUrlSettingFormProps): JSX.Element => {

  const [initialAgentUrl] = useState<string>(agentUrl);
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

  const isUrlChanged = agentUrl !== initialAgentUrl;

  const onUpdateSettingsChange = () => {
    onSave({ name: 'agentUrl', value: agentUrl });
  };

  return (
    <Box
      mb={ 4 }
      mt={ 4 }
    >
      <SettingTitle title='Loadmill Agent URL' />
      <TextField
        error={ !!urlError }
        fullWidth
        helperText={ urlError }
        label='Agent URL'
        margin='normal'
        onChange={ (event) => {
          setAgentUrl(event.target.value);
          validateUrl(event.target.value);
        } }
        value={ agentUrl }
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

export type AgentUrlSettingFormProps = {
  agentUrl: string;
  onSave: (changedSetting: ChangedSetting) => void;
  setAgentUrl: (agentUrl: string) => void;
};
