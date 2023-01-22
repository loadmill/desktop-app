import DownloadIcon from '@mui/icons-material/Download';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

export const DownloadCertificate = ({
  isInProgress,
  openSnackBar,
  setIsInProgress,
  setOpenSnackBar,
}: DownloadCertificateProps): JSX.Element => {

  const onDownloadClick = () => {
    setIsInProgress(true);
    window.desktopApi.downloadCertificate();
  };

  const onCloseSnackBar = () => {
    setOpenSnackBar(false);
  };

  return (
    <div
      style={ {
        alignItems: 'center',
        display: 'flex',
      } }
    >
      <IconButton
        className='fit-content'
        color='primary'
        disabled={ isInProgress }
        onClick={ onDownloadClick }
      >
        <DownloadIcon fontSize='small' />
      </IconButton>
      <Typography variant='caption'>
        Download and install CA certificate
      </Typography>
      <CustomizedSnackbars
        message='Certificate downloaded successfully!'
        onClose={ onCloseSnackBar }
        open={ openSnackBar }
        severity='success'
      />
    </div>
  );
};

export type DownloadCertificateProps = {
  isInProgress?: boolean;
  openSnackBar?: boolean;
  setIsInProgress?: (isInProgress: boolean) => void;
  setOpenSnackBar?: (openSnackBar: boolean) => void;
};
