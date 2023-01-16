import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { ProxyRendererMessage } from '../../../types/messaging';
import { ProxyEntry } from '../../../types/proxy-entry';
import { MESSAGE, PROXY, UPDATED_FILTERS } from '../../../universal/constants';

import { DownloadCertificate } from './download-certificate';
import { dummyEntries } from './dummy-entries-delete-later';
import { Entries } from './entries';
import { Filters } from './filters';

export const ProxyDashboard = (): JSX.Element => {
  const [shouldShowEntries, setShouldShowEntries] = useState<boolean>(true);
  const [entries, setEntries] = useState<ProxyEntry[]>(dummyEntries);
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    window.desktopApi.refreshFilters();
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
        case UPDATED_FILTERS:
          onUpdatedFilters(data);
          break;
        case PROXY:
          onProxyMsg(data);
          break;
        default:
          break;
      }
    }
  };

  const onUpdatedFilters = (data: ProxyRendererMessage['data']) => {
    const { filters } = data;
    console.log('got filters', filters);
    setFilters(filters);
  };

  const onProxyMsg = (data: ProxyRendererMessage['data']) => {
    const { proxy } = data;
    setEntries(prev => [...prev, proxy]);
    setShouldShowEntries(true);
  };

  return (
    <div
      className='page-wrapper'
    >
      <div
        className='proxy-dashboard-header'
      >
        <DownloadCertificate/>
        <Filters
          filters={ filters }
        />
      </div>
      {shouldShowEntries && (
        <Entries
          entries={ entries }
        />
      )}
    </div>
  );
};

export type ProxyDashboardProps = {};
