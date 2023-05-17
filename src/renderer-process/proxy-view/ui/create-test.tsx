import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

export const CreateTest = ({
  disabled = false,
  isLoadingCreateTest = false,
  onCreateTest,
}: CreateTestProps): JSX.Element => {

  const onClick = () => {
    onCreateTest();
  };

  return (
    <>
      <Button
        disabled={ disabled || isLoadingCreateTest }
        onClick={ onClick }
        startIcon={
          isLoadingCreateTest ?
            <CircularProgress size={ 20 }/> :
            <AddRoundedIcon/>
        }
        variant='contained'
      >
        {'Create Test'}
      </Button>
    </>
  );
};

export type CreateTestProps = {
  disabled?: boolean;
  isLoadingCreateTest?: boolean;
  onCreateTest?: () => void;
};
