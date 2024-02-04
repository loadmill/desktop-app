import DownloadIcon from '@mui/icons-material/Download';
import Chip from '@mui/material/Chip';
import React from 'react';

export const DownloadCertificate = ({
  isInProgress,
  setIsInProgress,
}: DownloadCertificateProps): JSX.Element => {

  const onDownloadClick = () => {
    setIsInProgress(true);
    window.desktopApi.downloadCertificate();
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
          borderRadius: 'inherit',
        } }
        variant='outlined'
      />
    </>
  );
};

export type DownloadCertificateProps = {
  isInProgress?: boolean;
  setIsInProgress?: (isInProgress: boolean) => void;
};
