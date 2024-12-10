import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

import { DownloadCertificate } from './download-certificate';

export const ConnectionInfoBanner = ({
  ipAddress,
  isDownloadInProgress,
  port,
  setIsDownloadInProgress,
}: ConnectionInfoBannerProps): JSX.Element => {
  return (
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
  );
};

export type ConnectionInfoBannerProps = {
  ipAddress: string,
  isDownloadInProgress: boolean,
  port: number,
  setIsDownloadInProgress: (isInProgress: boolean) => void
};
