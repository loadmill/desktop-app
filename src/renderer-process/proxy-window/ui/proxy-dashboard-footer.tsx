import React from 'react';

import { Analyze } from './analyze';
import { CreateTest } from './create-test';
import { LinkToProxyDocs } from './link-to-proxy-docs';

export const ProxyDashboardFooter = ({
  disabled,
  isLoadingAnalyze,
  isLoadingCreateTest,
  onAnalyze,
  onCreateTest,

}: ProxyDashboardFooterProps): JSX.Element => (
  <div
    className='proxy-dashboard-footer'
  >
    <LinkToProxyDocs />
    <div
      style={ {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
      } }
    >
      <Analyze
        disabled={ disabled }
        isLoadingAnalyze={ isLoadingAnalyze }
        onAnalyze={ onAnalyze }
      />
      <CreateTest
        disabled={ disabled }
        isLoadingCreateTest={ isLoadingCreateTest }
        onCreateTest={ onCreateTest }
      />
    </div>
  </div>
);

export type ProxyDashboardFooterProps = {
  disabled?: boolean;
  isLoadingAnalyze?: boolean;
  isLoadingCreateTest?: boolean;
  onAnalyze?: () => void;
  onCreateTest?: () => void;
};
