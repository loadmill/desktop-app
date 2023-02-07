import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Button from '@mui/material/Button';
import React from 'react';

const onAnalyze = () => {
  alert('Analyzing...');
};

export const AnalyzeButton = ({
  disabled = false,
}: AnalyzeButtonProps): JSX.Element => (
  <Button
    disabled={ disabled }
    onClick={ onAnalyze }
    startIcon={
      <AutoFixHighIcon />
    }
    variant='contained'
  >
    {'Analyze'}
  </Button>
);

export type AnalyzeButtonProps = {
  disabled?: boolean;
};
