import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

import { ChangedSetting, ProxySettings } from '../../../types/settings';

import { SettingTitle } from './setting-title';

/**
 * Parses a proxy URL into structured fields
 */
const parseProxyUrl = (url: string): Partial<ProxySettings> => {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      password: parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : undefined,
      protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https',
      username: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined,
    };
  } catch {
    return {};
  }
};

export const ProxySettingForm = ({
  onSave,
  proxySettings,
}: ProxySettingsFormProps): JSX.Element => {
  const [enabled, setEnabled] = useState<boolean>(!!proxySettings?.enabled);

  const initialValues = proxySettings?.host
    ? proxySettings
    : { ...proxySettings, ...parseProxyUrl(proxySettings?.url || '') };

  const [protocol, setProtocol] = useState<'http' | 'https'>(initialValues?.protocol || 'http');
  const [host, setHost] = useState<string>(initialValues?.host || '');
  const [port, setPort] = useState<string>(initialValues?.port?.toString() || '');
  const [username, setUsername] = useState<string>(initialValues?.username || '');
  const [password, setPassword] = useState<string>(initialValues?.password || '');

  const [hostError, setHostError] = useState<string>('');
  const [portError, setPortError] = useState<string>('');

  const validateAndSave = () => {
    setHostError('');
    setPortError('');

    if (enabled) {
      let hasError = false;

      if (!host) {
        setHostError('Host is required');
        hasError = true;
      }

      if (!port) {
        setPortError('Port is required');
        hasError = true;
      } else {
        const portNum = parseInt(port, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          setPortError('Port must be between 1 and 65535');
          hasError = true;
        }
      }

      if (hasError) {
        return;
      }

      const portNum = parseInt(port, 10);
      const newSettings: ProxySettings = {
        enabled,
        host,
        password: password || undefined,
        port: portNum,
        protocol,
        url: `${protocol}://${host}:${port}`, // Keep for backward compatibility
        username: username || undefined,
      };
      onSave({ name: 'proxy', value: newSettings });
    } else {
      const newSettings: ProxySettings = {
        enabled,
        host,
        password: password || undefined,
        port: port ? parseInt(port, 10) : undefined,
        protocol,
        url: '',
        username: username || undefined,
      };
      onSave({ name: 'proxy', value: newSettings });
    }
  };

  const onEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
  };

  const onHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHost(event.target.value);
    if (hostError) {
      setHostError('');
    }
  };

  const onPortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPort(event.target.value);
    if (portError) {
      setPortError('');
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
      <Box
        display='flex'
        gap={ 2 }
        mt={ 2 }
      >
        <Select
          disabled={ !enabled }
          onChange={ (event) => setProtocol(event.target.value as 'http' | 'https') }
          sx={ { minWidth: 120 } }
          value={ protocol }
        >
          <MenuItem value='http'>HTTP</MenuItem>
          <MenuItem value='https'>HTTPS</MenuItem>
        </Select>
        <TextField
          disabled={ !enabled }
          error={ !!hostError }
          fullWidth
          helperText={ hostError }
          label='Host'
          onChange={ onHostChange }
          required
          value={ host }
        />
        <TextField
          disabled={ !enabled }
          error={ !!portError }
          helperText={ portError }
          label='Port'
          onChange={ onPortChange }
          required
          sx={ { width: 150 } }
          type='number'
          value={ port }
        />
      </Box>
      <Box
        display='flex'
        gap={ 2 }
        mt={ 2 }
      >
        <TextField
          disabled={ !enabled }
          fullWidth
          helperText='Optional'
          label='Username'
          onChange={ (event) => setUsername(event.target.value) }
          value={ username }
        />
        <TextField
          disabled={ !enabled }
          fullWidth
          helperText='Optional'
          label='Password'
          onChange={ (event) => setPassword(event.target.value) }
          type='password'
          value={ password }
        />
      </Box>
      <Box mt={ 2 }>
        <Button
          color='primary'
          onClick={ validateAndSave }
          variant='contained'
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export type ProxySettingsFormProps = {
  onSave: (changedSetting: ChangedSetting) => void;
  proxySettings: ProxySettings;
};
