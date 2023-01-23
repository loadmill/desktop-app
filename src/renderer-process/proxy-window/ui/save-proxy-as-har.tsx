import SaveAltIcon from '@mui/icons-material/SaveAlt';
import IconButton from '@mui/material/IconButton';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

export const SaveProxyAsHar = ({
  onSave,
  openSnackBar,
  setOpenSnackBar,
}: DownloadProxyAsHarProps): JSX.Element => {
  const onCloseSnackBar = () => {
    setOpenSnackBar(false);
  };

  return (
    <div>
      <IconButton
        onClick={ onSave }
      >
        <SaveAltIcon fontSize='small' />
      </IconButton>
      <CustomizedSnackbars
        message='Har file saved successfully!'
        onClose={ onCloseSnackBar }
        open={ openSnackBar }
        severity='success'
      />
    </div>
  );
};

export type DownloadProxyAsHarProps = {
  onSave: () => void;
  openSnackBar?: boolean;
  setOpenSnackBar?: (openSnackBar: boolean) => void;
};
