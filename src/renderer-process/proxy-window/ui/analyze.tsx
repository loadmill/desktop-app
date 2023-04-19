import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

export const Analyze = ({
  disabled = false,
  isLoadingAnalyze = false,
  onAnalyze,
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
  </>
);

export type AnalyzeButtonProps = {
  disabled?: boolean;
  isLoadingAnalyze?: boolean;
  onAnalyze?: () => void;
};
