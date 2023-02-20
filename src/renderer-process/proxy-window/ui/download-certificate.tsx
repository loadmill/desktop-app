import DownloadIcon from '@mui/icons-material/Download';
import Chip from '@mui/material/Chip';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

// on download click, send a message to the main process
// then main process will read the certificate using fs
// then main process will send the certificate back to the renderer process
// then renderer process will download the certificate
// nice and simple :)

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
        icon={ <DownloadIcon color='info' /> }
        label='Certificate'
        onClick={ onDownloadClick }
        size='small'
        sx={ {
          borderRadius: 'inherit'
        } }
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
