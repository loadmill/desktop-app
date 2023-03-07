import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import { CustomizedSnackbars } from './snack-bar';

export const CreateTest = ({
  createTestSnackBarMessage,
  disabled = false,
  isLoadingCreateTest = false,
  onCloseSnackBar,
  onCreateTest,
  openSnackBar,
  severity,
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
      <CustomizedSnackbars
        message={ createTestSnackBarMessage }
        onClose={ onCloseSnackBar }
        open={ openSnackBar }
        severity={ severity }
      />
    </>
  );
};

export type CreateTestProps = {
  createTestSnackBarMessage?: string;
  disabled?: boolean;
  isLoadingCreateTest?: boolean;
  onCloseSnackBar?: () => void;
  onCreateTest?: () => void;
  openSnackBar?: boolean;
  severity?: 'error' | 'success';
};
