import {
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import React from 'react';

import { ChangedSetting } from '../../../types/settings';

import { SettingTitle } from './setting-title';

export const AutoUpdateSettingForm = ({
  autoUpdate,
  onSave,
  setAutoUpdate,
}: AutoUpdateSettingFormProps): JSX.Element => {

  const onUpdateSettingsChange = () => {
    const value = !autoUpdate;
    setAutoUpdate(value);
    onSave({ name: 'autoUpdate', value });
  };

  return (
    <Box
      mb={ 4 }
      mt={ 4 }
    >
      <SettingTitle title='Update Settings' />
      <FormControlLabel
        checked={ autoUpdate }
        control={ <Checkbox /> }
        label='Auto Updates'
        onChange={ onUpdateSettingsChange }
      />
    </Box>
  );
};

export type AutoUpdateSettingFormProps = {
  autoUpdate: boolean;
  onSave: (changedSetting: ChangedSetting) => void;
  setAutoUpdate: (autoUpdate: boolean) => void;
};
