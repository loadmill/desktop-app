import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { ProxyRendererMessage } from '../../../types/messaging';
import { ProxyEntry } from '../../../types/proxy-entry';
import { SuiteOption } from '../../../types/suite';
import {
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORTED_AS_HAR_SUCCESS,
  INIT_FILTER_REGEX,
  IP_ADDRESS,
  IS_RECORDING,
  MESSAGE,
  PROXY,
  UPDATED_ENTRIES,
  UPDATED_SUITES
} from '../../../universal/constants';

import { AnalyzeButton } from './analyze-button';
import { ClearAll } from './clear-all';
import { CreateTestButton } from './create-test-button';
import { DownloadCertificate } from './download-certificate';
import { FilterRegex } from './filters';
import { ProxyEntries } from './proxy-entries';
import { Recording } from './recording';
import { SuitesAutocomplete } from './suites-autocomplete';

export const ProxyDashboard = (): JSX.Element => {
  const [shouldShowEntries, setShouldShowEntries] = useState<boolean>(false);
  const [entries, setEntries] = useState<ProxyEntry[]>([]);
  const [filterRegex, setFilterRegex] = useState<string>('');
  const [suites, setSuites] = useState<SuiteOption[]>([]);
  const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
  const [showDownloadSuccessSnackBar, setShowDownloadSuccessSnackBar] = useState<boolean>(false);
  const [showExportAsHarSuccessSnackBar, setShowExportAsHarSuccessSnackBar] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [loadingEntries, setLoadingEntries] = useState<boolean>(false);

  useEffect(() => {
    window.desktopApi.fetchSuites();
    window.desktopApi.getIpAddress();
    window.desktopApi.initFilterRegex();
    window.desktopApi.isRecording();
    window.desktopApi.refreshEntries();
  }, []);

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);
    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  const onPreloadMessage = (event: MessageEvent<ProxyRendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case DOWNLOADED_CERTIFICATE_SUCCESS:
          onDownloadedCertificateSuccess(data);
          break;
        case INIT_FILTER_REGEX:
          onInitFilterRegex(data);
          break;
        case IP_ADDRESS:
          onIpAddress(data);
          break;
        case IS_RECORDING:
          onIsRecording(data);
          break;
        case PROXY:
          onProxyMsg(data);
          break;
        case EXPORTED_AS_HAR_SUCCESS:
          onExportedAsHarSuccess(data);
          break;
        case UPDATED_ENTRIES:
          onUpdatedEntries(data);
          break;
        case UPDATED_SUITES:
          onUpdatedSuites(data);
          break;
        default:
          break;
      }
    }
  };

  const onDownloadedCertificateSuccess = (_data: ProxyRendererMessage['data']) => {
    setIsDownloadInProgress(false);
    setShowDownloadSuccessSnackBar(true);
  };

  const onInitFilterRegex = ({ filterRegex }: ProxyRendererMessage['data']) => {
    setFilterRegex(filterRegex);
  };

  const onIpAddress = ({ ipAddress }: ProxyRendererMessage['data']) => {
    setIpAddress(ipAddress);
  };

  const onIsRecording = ({ isRecording }: ProxyRendererMessage['data']) => {
    setIsRecording(isRecording);
  };

  const onProxyMsg = ({ proxy }: ProxyRendererMessage['data']) => {
    setEntries(prev => [...prev, proxy]);
    setShouldShowEntries(true);
  };

  const onExportedAsHarSuccess = (_data: ProxyRendererMessage['data']) => {
    setShowExportAsHarSuccessSnackBar(true);
  };

  const onUpdatedEntries = ({ proxies }: ProxyRendererMessage['data']) => {
    setEntries(proxies);
    if (proxies.length > 0) {
      setLoadingEntries(false);
      setShouldShowEntries(true);
    }
  };

  const onUpdatedSuites = ({ suites }: ProxyRendererMessage['data']) => {
    setSuites(suites);
  };

  const isClearAllDisabled = !shouldShowEntries;

  return (
    <div
      className='page-wrapper'
    >
      <div
        className='proxy-dashboard-header'
      >
        <div style={ { display: 'flex', gap: '8px' } }>
          <Recording
            isRecording={ isRecording }
          />
          <ClearAll
            disabled={ isClearAllDisabled }
          />
        </div>
        <Paper
          sx={ {
            alignItems: 'center',
            display: 'flex',
            gap: '8px',
            padding: '6px',
          } }
          variant='outlined'
        >
          <Typography
            style={ {
              alignItems: 'baseline',
              display: 'flex',
              gap: '4px',
            } }
            variant='body2'
          >
            { 'Listening on' }
            <Typography
              variant='button'
            >
              { ipAddress + ':1234' }
            </Typography>
          </Typography>
          <DownloadCertificate
            isInProgress={ isDownloadInProgress }
            openSnackBar={ showDownloadSuccessSnackBar }
            setIsInProgress={ setIsDownloadInProgress }
            setOpenSnackBar={ setShowDownloadSuccessSnackBar }
          />
        </Paper>
        <div style={ { display: 'flex', gap: '8px' } }>
          <FilterRegex
            filterRegex={ filterRegex }
            setFilterRegex={ setFilterRegex }
          />
          <SuitesAutocomplete
            suites={ suites }
          />
        </div>
      </div>
      <div
        className='proxy-entries-list'
      >
        {loadingEntries && !shouldShowEntries && (
          <>
            <Skeleton animation='wave' />
            <Skeleton animation='wave' />
            <Skeleton animation='wave' />
          </>
        )}
        {shouldShowEntries && (
          <ProxyEntries
            entries={ entries }
            selectedEntriesActionsProps={ {
              clear: {
                setLoading: setLoadingEntries,
              },
              export: {
                setShowExportAsHarSuccessSnackBar: setShowExportAsHarSuccessSnackBar,
                showExportAsHarSuccessSnackBar: showExportAsHarSuccessSnackBar,
              }
            } }
          />
        )}
      </div>
      <div
        style={ {
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
        } }
      >
        <AnalyzeButton
          disabled={ !shouldShowEntries }
        />
        <CreateTestButton
          disabled={ !shouldShowEntries }
        />
      </div>
    </div>
  );
};

export type ProxyDashboardProps = {};
