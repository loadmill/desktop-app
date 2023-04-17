import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

export const ExportProxyAsHar = ({
  disabled = false,
  onExport,
}: ExportProxyAsHarProps): JSX.Element => {
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
    </>
  );
};

export type ExportProxyAsHarProps = {
  disabled?: boolean;
  onExport: () => void;
};
