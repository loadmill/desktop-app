import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

export const Analyze = ({
  analyzeSnackBarMessage,
  disabled = false,
  isLoadingAnalyze = false,
  onCloseSnackBar,
  onAnalyze,
  openSnackBar,
  severity,
}: AnalyzeButtonProps): JSX.Element => (
  <>
    <Button
      disabled={ disabled || isLoadingAnalyze }
      onClick={ onAnalyze }
      startIcon={
        isLoadingAnalyze ?
          <CircularProgress size={ 20 } /> :
          <AutoFixHighIcon />
      }
      variant='contained'
    >
      {'Analyze'}
    </Button>
    <CustomizedSnackbars
      message={ analyzeSnackBarMessage }
      onClose={ onCloseSnackBar }
      open={ openSnackBar }
      severity={ severity }
    />
  </>
);

export type AnalyzeButtonProps = {
  analyzeSnackBarMessage?: string;
  disabled?: boolean;
  isLoadingAnalyze?: boolean;
  onAnalyze?: () => void;
  onCloseSnackBar?: () => void;
  openSnackBar?: boolean;
  severity?: 'error' | 'success';
};
