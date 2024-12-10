import React from 'react';

import { SuiteOption } from '../../../types/suite';

import { ClearAll } from './clear-all';
import { ConnectionInfoBanner } from './connection-info-banner';
import { FilterRegex } from './filters';
import { ImportHar } from './import-har';
import { ProfilesAutocomplete } from './profiles-autocomplete';
import { Recording } from './recording';
import { SuitesAutocomplete } from './suites-autocomplete';

export const ProxyDashboardHeader = ({
  filterRegex,
  ipAddress,
  isClearAllDisabled,
  isDownloadInProgress,
  isFetchingProfiles,
  isFetchingSuites,
  isImportHarDisabled,
  isImportHarInProgress,
  isRecording,
  onImportHarClick,
  onSearchProfiles,
  onSearchSuites,
  port,
  profiles,
  selectedProfile,
  selectedSuite,
  setFilterRegex,
  setIsDownloadInProgress,
  onSelectProfile,
  setSelectedSuite,
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
    <ConnectionInfoBanner
      ipAddress={ ipAddress }
      isDownloadInProgress={ isDownloadInProgress }
      port={ port }
      setIsDownloadInProgress={ setIsDownloadInProgress }
    />
    <div className='d-flex-sm-gap'>
      <FilterRegex
        filterRegex={ filterRegex }
        setFilterRegex={ setFilterRegex }
      />
      {profiles.length > 1 && (
        <ProfilesAutocomplete
          isFetchingProfiles={ isFetchingProfiles }
          onSearchProfiles={ onSearchProfiles }
          onSelectProfile={ onSelectProfile }
          profiles={ profiles }
          selectedProfile={ selectedProfile }
        />
      )}
      <SuitesAutocomplete
        isFetchingSuites={ isFetchingSuites }
        onSearchSuites={ onSearchSuites }
        selectedSuite={ selectedSuite }
        setSelectedSuite={ setSelectedSuite }
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
  isFetchingProfiles: boolean;
  isFetchingSuites: boolean;
  isImportHarDisabled?: boolean;
  isImportHarInProgress?: boolean;
  isRecording?: boolean;
  onImportHarClick?: () => void;
  onSearchProfiles: (search: string) => void;
  onSearchSuites: (search: string) => void;
  onSelectProfile?: (profile: string | null) => void;
  port?: number;
  profiles: string[];
  selectedProfile: string | null;
  selectedSuite: SuiteOption | null;
  setFilterRegex?: (filterRegex: string) => void;
  setIsDownloadInProgress?: (isInProgress: boolean) => void;
  setSelectedSuite?: (suite: SuiteOption | null) => void;
  suites: SuiteOption[];
};
