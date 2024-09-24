import Skeleton from '@mui/material/Skeleton';
import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { SettingsRendererMessage } from '../../../types/messaging';
import { Settings } from '../../../types/settings';
import { FETCH_SETTINGS, MESSAGE, SAVE_SETTINGS } from '../../../universal/constants';
import { CustomizedSnackbars } from '../../snack-bar';

import { SettingsForm } from './settings-form';

export const SettingsPage = (): JSX.Element => {
  const [settings, setSettings] = useState<Settings>({});
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [openSnackBar, setOpenSnackBar] = useState<boolean>(false);
  const [snackBarSeverity, setSnackBarSeverity] = useState<'error' | 'success'>('success');

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);
    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  useEffect(() => {
    window.desktopApi.fetchSettings();
  }, []);

  const onPreloadMessage = (event: MessageEvent<SettingsRendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case FETCH_SETTINGS:
          onFetchSettings(data);
          break;
        case SAVE_SETTINGS:
          onSaveSettings(data);
          break;
      }
    }
  };

  const onFetchSettings = (data: SettingsRendererMessage['data']) => {
    if (data?.settings) {
      setSettings(data.settings);
    } else {
      setSnackBarMessage('Failed to get settings');
      setSnackBarSeverity('error');
      setOpenSnackBar(true);
    }
    setLoadingSettings(false);
  };

  const onSaveSettings = (data: SettingsRendererMessage['data']) => {
    if (data?.error) {
      setSnackBarMessage(data.error);
      setSnackBarSeverity('error');
      setOpenSnackBar(true);
    } else {
      setSnackBarMessage('Settings saved successfully');
      setSnackBarSeverity('success');
      setOpenSnackBar(true);
    }
  };

  const onCloseSnackBar = () => {
    setOpenSnackBar(false);
    setSnackBarMessage('');
    setSnackBarSeverity('success');
  };

  const onChange = (field: keyof Settings['proxy'], value: string | number | boolean) => {
    setSettings({
      ...settings,
      proxy: {
        ...settings.proxy,
        [field]: value,
      },
    });
  };

  const saveSettings = () => {
    window.desktopApi.saveSettings(settings);
  };

  return (
    <div
      className='page-wrapper'
      style={ {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
      } }
    >
      <h1>Settings</h1>

      {loadingSettings ? (
        <>
          <Skeleton
            height={ 64 }
          />
          <Skeleton
            height={ 200 }
            variant='rounded'
          />
        </>
      ) : (
        <SettingsForm
          onChange={ onChange }
          onSave={ saveSettings }
          settings={ settings }
        />
      )}
      {
        openSnackBar &&
          <CustomizedSnackbars
            message={ snackBarMessage }
            onClose={ onCloseSnackBar }
            open={ openSnackBar }
            severity={ snackBarSeverity }
          />
      }
    </div>
  );
};

export type SettingsPageProps = {};
