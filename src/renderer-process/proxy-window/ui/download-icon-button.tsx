import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

export const DownloadIconButton = ({
  color = 'primary',
  disabled = false,
  onDownload,
}: DownloadIconButtonProps): JSX.Element => (
  <Tooltip
    title='Save proxy as HAR'
  >
    <IconButton
      className='fit-content'
      color={ color }
      disabled={ disabled }
      onClick={ onDownload }
    >
      <DownloadIcon fontSize='small' />
    </IconButton>
  </Tooltip>
);

export type DownloadIconButtonProps = {
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  onDownload?: () => void;
};
