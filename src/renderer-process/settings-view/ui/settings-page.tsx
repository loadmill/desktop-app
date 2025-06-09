import Skeleton from '@mui/material/Skeleton';
import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { SettingsRendererMessage } from '../../../types/messaging';
import { ChangedSetting, ProxySettings } from '../../../types/settings';
import { FETCH_SETTINGS, MESSAGE, SETTING_CHANGED } from '../../../universal/constants';
import {
  defaultAutoUpdateSetting,
  defaultProxySettings,
} from '../../../universal/default-settings';
import { CustomizedSnackbars } from '../../snack-bar';

import { SettingsForm } from './settings-form';

export const SettingsPage = (): JSX.Element => {
  const [autoUpdateSetting, setAutoUpdateSetting] = useState<boolean>(defaultAutoUpdateSetting);
  const [proxySettings, setProxySettings] = useState<ProxySettings>(defaultProxySettings);
  const [onPremUrl, setOnPremUrl] = useState<string>('');

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
        case SETTING_CHANGED:
          onSettingChanged(data);
          break;
      }
    }
  };

  const onFetchSettings = (data: SettingsRendererMessage['data']) => {
    if (data?.settings) {
      const { settings } = data;
      setAutoUpdateSetting(settings.autoUpdate);
      setProxySettings(settings.proxy || { enabled: false, url: '' });
      setOnPremUrl(settings.onPremURL || '');
    } else {
      setSnackBarMessage('Failed to get settings');
      setSnackBarSeverity('error');
      setOpenSnackBar(true);
    }
    setLoadingSettings(false);
  };

  const onSettingChanged = (data: SettingsRendererMessage['data']) => {
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

  const saveChangedSetting = (changedSetting: ChangedSetting) => {
    window.desktopApi.settingChanged(changedSetting);
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
          autoUpdate={ autoUpdateSetting }
          onPremURL={ onPremUrl }
          onSave={ saveChangedSetting }
          proxySettings={ proxySettings }
          setAutoUpdate={ setAutoUpdateSetting }
          setOnPremURL={ setOnPremUrl }
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
