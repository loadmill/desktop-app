import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

export const ExportProxyAsHar = ({
  disabled = false,
  onExport,
  openSnackBar,
  setOpenSnackBar,
}: ExportProxyAsHarProps): JSX.Element => {
  const onCloseSnackBar = () => {
    setOpenSnackBar(false);
  };

  return (
    <>
      <Tooltip
        title='Export selected entries as HAR file'
      >
        <Button
          disabled={ disabled }
          onClick={ onExport }
          startIcon={
            <SaveAltIcon
              color='primary'
              fontSize='medium'
            />
          }
          variant='outlined'
        >
          {'Export'}
        </Button>
      </Tooltip>
      <CustomizedSnackbars
        message='Har file exported successfully!'
        onClose={ onCloseSnackBar }
        open={ openSnackBar }
        severity='success'
      />
    </>
  );
};

export type ExportProxyAsHarProps = {
  disabled?: boolean;
  onExport: () => void;
  openSnackBar?: boolean;
  setOpenSnackBar?: (openSnackBar: boolean) => void;
};
