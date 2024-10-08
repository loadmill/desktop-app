import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import React from 'react';

import { Settings } from '../../../types/settings';

export const SettingsForm = ({
  settings,
  onChange,
  onSave,
}: SettingsFormProps): JSX.Element => {

  const onChanges = (field: keyof Settings['proxy']) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onChange(field, value);
  };

  return (
    <form
      autoComplete='off'
      noValidate
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={ !!settings.proxy?.enabled }
            onChange={ onChanges('enabled') }
          />
        }
        label='Enable Proxy'
      />
      <TextField
        fullWidth
        label='Proxy URL'
        margin='normal'
        onChange={ onChanges('url') }
        value={ settings.proxy?.url || '' }
      />
      <Button
        color='primary'
        onClick={ onSave }
        style={ {
          display: 'block',
          marginLeft: 'auto',
          marginTop: '1rem',
        } }
        variant='contained'
      >
        Save Settings
      </Button>
    </form>
  );
};

export type SettingsFormProps = {
  onChange: (field: keyof Settings['proxy'], value: string | number | boolean) => void;
  onSave: () => void;
  settings: Settings;
}
