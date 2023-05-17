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
  <div className='proxy-dashboard-footer'>
    <LinkToProxyDocs />
    <div className='d-flex-sm-gap'>
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
