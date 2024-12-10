import Skeleton from '@mui/material/Skeleton';
import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { ProxyRendererMessage } from '../../../types/messaging';
import { ProxyEntry } from '../../../types/proxy-entry';
import { SuiteOption, TestSuite } from '../../../types/suite';
import {
  ANALYZE_REQUESTS_COMPLETE,
  CREATE_TEST_COMPLETE,
  DOWNLOADED_CERTIFICATE_SUCCESS,
  EXPORTED_AS_HAR_SUCCESS,
  GET_PROFILE,
  IMPORT_HAR,
  IMPORT_HAR_IS_IN_PROGRESS,
  INIT_FILTER_REGEX,
  IP_ADDRESS,
  IS_RECORDING,
  MESSAGE,
  PORT,
  PROXY,
  UPDATED_ENTRIES,
  UPDATED_PROFILES,
  UPDATED_SUITES,
} from '../../../universal/constants';
import { CustomizedSnackbars } from '../../snack-bar';

import { ProxyDashboardFooter } from './proxy-dashboard-footer';
import { ProxyDashboardHeader } from './proxy-dashboard-header';
import { ProxyEntries } from './proxy-entries';

const searchDelay = 500;
let searchSuitesTimeout: NodeJS.Timeout;
let searchProfilesTimeout: NodeJS.Timeout;

export const ProxyDashboard = (): JSX.Element => {
  const [shouldShowEntries, setShouldShowEntries] = useState<boolean>(false);
  const [entries, setEntries] = useState<ProxyEntry[]>([]);
  const [filterRegex, setFilterRegex] = useState<string>('');
  const [suites, setSuites] = useState<SuiteOption[]>([]);
  const [isFetchingSuites, setIsFetchingSuites] = React.useState(true);
  const [isDownloadInProgress, setIsDownloadInProgress] = React.useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [port, setPort] = useState<number>(0);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(true);
  const [selectedSuite, setSelectedSuite] = useState<SuiteOption>();
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = React.useState(true);
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isLoadingCreateTest, setIsLoadingCreateTest] = useState<boolean>(false);
  const [severity, setSeverity] = useState<'error' | 'success'>('success');
  const [isLoadingAnalyze, setIsLoadingAnalyze] = useState<boolean>(false);
  const [isImportHarInProgress, setIsImportHarInProgress] = useState<boolean>(false);
  const [isImportHarDisabled, setIsImportHarDisabled] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [openSnackBar, setOpenSnackBar] = useState<boolean>(false);

  useEffect(() => {
    window.desktopApi.fetchProfiles();
    window.desktopApi.fetchSuites();
    window.desktopApi.getIpAddress();
    window.desktopApi.getProfile();
    window.desktopApi.initFilterRegex();
    window.desktopApi.isRecording();
    window.desktopApi.getPort();
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
        case ANALYZE_REQUESTS_COMPLETE:
          onAnalyzeComplete(data);
          break;
        case CREATE_TEST_COMPLETE:
          onCreateTestComplete(data);
          break;
        case DOWNLOADED_CERTIFICATE_SUCCESS:
          onDownloadedCertificateSuccess(data);
          break;
        case GET_PROFILE:
          onGetProfile(data);
          break;
        case IMPORT_HAR:
          onImportHar(data);
          break;
        case IMPORT_HAR_IS_IN_PROGRESS:
          onImportHarIsInProgress(data);
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
        case PORT:
          onPort(data);
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
        case UPDATED_PROFILES:
          onUpdatedProfiles(data);
          break;
        case UPDATED_SUITES:
          onUpdatedSuites(data);
          break;
        default:
          break;
      }
    }
  };

  const onAnalyzeComplete = (data: ProxyRendererMessage['data']) => {
    if (data?.error) {
      setSnackBarMessage('Analyzing requests failed: ' + data?.error);
      setSeverity('error');
    } else {
      setSnackBarMessage('Analyzed requests successfully');
    }
    setOpenSnackBar(true);
    setIsLoadingAnalyze(false);
  };

  const onCreateTestComplete = (data: ProxyRendererMessage['data']) => {
    if (data?.error) {
      setSnackBarMessage('Creating test failed: ' + data?.error);
      setSeverity('error');
    } else {
      setSnackBarMessage('Created test successfully');
    }
    setOpenSnackBar(true);
    setIsLoadingCreateTest(false);
  };

  const onDownloadedCertificateSuccess = (_data: ProxyRendererMessage['data']) => {
    setSnackBarMessage('Downloaded certificate successfully');
    setOpenSnackBar(true);
    setIsDownloadInProgress(false);
  };

  const onGetProfile = ({ profile }: ProxyRendererMessage['data']) => {
    setSelectedProfile(profile);
  };

  const onImportHar = (data: ProxyRendererMessage['data']) => {
    if (!data?.canceledAction) {
      if (data?.error) {
        setSnackBarMessage('Importing HAR file failed: ' + data?.error);
        setSeverity('error');
      } else {
        setSnackBarMessage('Imported HAR file successfully');
      }
      setOpenSnackBar(true);
    }
    setIsImportHarInProgress(false);
    setIsImportHarDisabled(false);
  };

  const onImportHarIsInProgress = (_data: ProxyRendererMessage['data']) => {
    setIsImportHarInProgress(true);
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

  const onPort = ({ port }: ProxyRendererMessage['data']) => {
    setPort(port);
  };

  const onProxyMsg = ({ proxy }: ProxyRendererMessage['data']) => {
    setEntries(prev => [...prev, proxy]);
    setShouldShowEntries(true);
  };

  const onExportedAsHarSuccess = (_data: ProxyRendererMessage['data']) => {
    setSnackBarMessage('Exported as HAR file successfully');
    setOpenSnackBar(true);
  };

  const onUpdatedEntries = ({ proxies }: ProxyRendererMessage['data']) => {
    setShouldShowEntries(false);
    setLoadingEntries(true);
    setEntries(proxies);
    if (proxies.length > 0) {
      setShouldShowEntries(true);
    }
    setLoadingEntries(false);
  };

  const onUpdatedSuites = ({ suites, search }: ProxyRendererMessage['data']) => {
    setSuites(toSuiteOptions(suites, search));
    setIsFetchingSuites(false);
  };

  const onUpdatedProfiles = ({ profiles }: ProxyRendererMessage['data']) => {
    setProfiles(profiles);
    setIsFetchingProfiles(false);
  };

  const onSelectProfile = (profile: string) => {
    if (profiles.includes(profile)) {
      setSelectedProfile(profile);
      window.desktopApi.setProfile(profile);
    }
  };

  const onCreateTest = () => {
    setIsLoadingCreateTest(true);
    window.desktopApi.createTest(selectedSuite);
  };

  const onSearchSuites = (search: string) => {
    setSuites([]);
    setIsFetchingSuites(true);
    debounceSearchSuites(search);
  };

  const onSearchProfiles = (search: string) => {
    setIsFetchingProfiles(true);
    debounceSearchProfiles(search);
  };

  const onAnalyze = () => {
    setIsLoadingAnalyze(true);
    window.desktopApi.analyzeRequests();
  };

  const onImportHarClick = () => {
    setIsImportHarDisabled(true);
    window.desktopApi.importHar();
  };

  const onCloseSnackBar = () => {
    setOpenSnackBar(false);
    setSnackBarMessage('');
    setSeverity('success');
  };

  const isClearAllDisabled = !shouldShowEntries;

  return (
    <div
      className='page-wrapper'
    >
      <ProxyDashboardHeader
        filterRegex={ filterRegex }
        ipAddress={ ipAddress }
        isClearAllDisabled={ isClearAllDisabled }
        isDownloadInProgress={ isDownloadInProgress }
        isFetchingProfiles={ isFetchingProfiles }
        isFetchingSuites={ isFetchingSuites }
        isImportHarDisabled={ isImportHarDisabled }
        isImportHarInProgress={ isImportHarInProgress }
        isRecording={ isRecording }
        onImportHarClick={ onImportHarClick }
        onSearchProfiles={ onSearchProfiles }
        onSearchSuites={ onSearchSuites }
        onSelectProfile={ onSelectProfile }
        port={ port }
        profiles={ profiles }
        selectedProfile={ selectedProfile }
        selectedSuite={ selectedSuite }
        setFilterRegex={ setFilterRegex }
        setIsDownloadInProgress={ setIsDownloadInProgress }
        setSelectedSuite={ setSelectedSuite }
        suites={ suites }
      />
      <div
        className='proxy-entries-list'
      >
        {loadingEntries && !shouldShowEntries && (
          <>
            <Skeleton
              height={ 64 }
            />
            <Skeleton
              height={ 200 }
              variant='rounded'
            />
          </>
        )}
        {shouldShowEntries && (
          <ProxyEntries
            entries={ entries }
            selectedEntriesActionsProps={ {
              clear: {
                setLoading: setLoadingEntries,
              },
            } }
          />
        )}
      </div>
      <ProxyDashboardFooter
        disabled={ !shouldShowEntries }
        isLoadingAnalyze={ isLoadingAnalyze }
        isLoadingCreateTest={ isLoadingCreateTest }
        onAnalyze={ onAnalyze }
        onCreateTest={ onCreateTest }
      />
      {
        openSnackBar &&
          <CustomizedSnackbars
            message={ snackBarMessage }
            onClose={ onCloseSnackBar }
            open={ openSnackBar }
            severity={ severity }
          />
      }
    </div>
  );
};

const toSuiteOptions = (testSuites: TestSuite[], search: string): SuiteOption[] => {
  const suiteOptions: SuiteOption[] = testSuites.map(({ description, id }) => ({ description, id }));
  appendNewSuiteOptionIfNotExists(suiteOptions, search);
  return suiteOptions;
};

const appendNewSuiteOptionIfNotExists = (suiteOptions: SuiteOption[], search?: string) => {
  const isExists = suiteOptions.some(({ description }) => description === search);
  if (search && !isExists) {
    suiteOptions.push({ description: search, id: '' });
  }
};

const debounceSearchSuites = (search: string) => {
  clearTimeout(searchSuitesTimeout);
  searchSuitesTimeout = setTimeout(() => {
    window.desktopApi.fetchSuites(search);
  }, searchDelay);
};

const debounceSearchProfiles = (search: string) => {
  clearTimeout(searchProfilesTimeout);
  searchProfilesTimeout = setTimeout(() => {
    window.desktopApi.fetchProfiles(search);
  }, searchDelay);
};

export type ProxyDashboardProps = {};
