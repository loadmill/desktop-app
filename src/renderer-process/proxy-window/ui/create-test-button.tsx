import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/material/Button';
import React from 'react';

const onCreateTest = () => {
  alert('Creating test...');
};

export const CreateTestButton = ({
  disabled = false,
}: CreateTestButtonProps): JSX.Element => (
  <Button
    disabled={ disabled }
    onClick={ onCreateTest }
    startIcon={
      <AddRoundedIcon />
    }
    variant='contained'
  >
    {'Create Test'}
  </Button>
);

export type CreateTestButtonProps = {
  disabled?: boolean;
};
