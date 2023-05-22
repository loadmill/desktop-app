import FileUploadIcon from '@mui/icons-material/FileUpload';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

export const ImportHar = ({
  disabled = false,
  isImportHarInProgress = false,
  onImportHar,
}: ImportHarProps): JSX.Element => (
  <>
    <Button
      disabled={ disabled }
      onClick={ onImportHar }
      startIcon={
        isImportHarInProgress ?
          <CircularProgress size={ 20 } /> :
          <FileUploadIcon color='info' />
      }
      variant='outlined'
    >
      {'Import'}
    </Button>
  </>
);

export type ImportHarProps = {
  disabled?: boolean;
  isImportHarInProgress?: boolean;
  onImportHar?: () => void;
};
