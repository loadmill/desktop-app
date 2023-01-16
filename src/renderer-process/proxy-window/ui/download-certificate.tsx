import Link from '@mui/material/Link';
import React from 'react';

export const DownloadCertificate = (): JSX.Element => (
  <>
    <Link
      className='fit-content'
      component='button'
      onClick={ window.desktopApi.downloadCertificate }
    >
      Download and install CA certificate
    </Link>
  </>
);

export type DownloadCertificateProps = {};
