import DownloadIcon from '@mui/icons-material/Download';
import Chip from '@mui/material/Chip';
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
    <>
      <Chip
        color='primary'
        disabled={ isInProgress }
        icon={ <DownloadIcon /> }
        label='Certificate'
        onClick={ onDownloadClick }
        size='small'
        variant='outlined'
      />
      <CustomizedSnackbars
        message='Certificate downloaded successfully!'
        onClose={ onCloseSnackBar }
        open={ openSnackBar }
        severity='success'
      />
    </>
  );
};

export type DownloadCertificateProps = {
  isInProgress?: boolean;
  openSnackBar?: boolean;
  setIsInProgress?: (isInProgress: boolean) => void;
  setOpenSnackBar?: (openSnackBar: boolean) => void;
};
