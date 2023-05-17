import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

import { SuiteOption } from '../../../types/suite';

import { ClearAll } from './clear-all';
import { DownloadCertificate } from './download-certificate';
import { FilterRegex } from './filters';
import { ImportHar } from './import-har';
import { Recording } from './recording';
import { SuitesAutocomplete } from './suites-autocomplete';

export const ProxyDashboardHeader = ({
  filterRegex,
  ipAddress,
  isClearAllDisabled,
  isDownloadInProgress,
  isImportHarDisabled,
  isImportHarInProgress,
  isRecording,
  onImportHarClick,
  port,
  selectedSuiteId,
  setFilterRegex,
  setIsDownloadInProgress,
  setSelectedSuiteId,
  suites,
}: ProxyDashboardHeaderProps): JSX.Element => (
  <div
    className='proxy-dashboard-header'
  >
    <div className='d-flex-sm-gap'>
      <Recording
        isRecording={ isRecording }
      />
      <ImportHar
        disabled={ isImportHarDisabled }
        isImportHarInProgress={ isImportHarInProgress }
        onImportHar={ onImportHarClick }
      />
      <ClearAll
        disabled={ isClearAllDisabled }
      />
    </div>
    <Paper
      className='d-flex-sm-gap'
      sx={ {
        alignItems: 'center',
        padding: '6px',
      } }
      variant='outlined'
    >
      <Typography
        className='d-flex-xs-gap'
        style={ {
          alignItems: 'baseline',
        } }
        variant='body2'
      >
        {'Listening on'}
        <Typography
          variant='button'
        >
          {ipAddress + ':' + port}
        </Typography>
      </Typography>
      <DownloadCertificate
        isInProgress={ isDownloadInProgress }
        setIsInProgress={ setIsDownloadInProgress }
      />
    </Paper>
    <div className='d-flex-sm-gap'>
      <FilterRegex
        filterRegex={ filterRegex }
        setFilterRegex={ setFilterRegex }
      />
      <SuitesAutocomplete
        selectedSuiteId={ selectedSuiteId }
        setSelectedSuiteId={ setSelectedSuiteId }
        suites={ suites }
      />
    </div>
  </div>
);

export type ProxyDashboardHeaderProps = {
  filterRegex?: string;
  ipAddress?: string;
  isClearAllDisabled?: boolean;
  isDownloadInProgress?: boolean;
  isImportHarDisabled?: boolean;
  isImportHarInProgress?: boolean;
  isRecording?: boolean;
  onImportHarClick?: () => void;
  port?: number;
  selectedSuiteId?: string;
  setFilterRegex?: (filterRegex: string) => void;
  setIsDownloadInProgress?: (isInProgress: boolean) => void;
  setSelectedSuiteId?: (suiteId: string) => void;
  suites?: SuiteOption[];
};
