import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import React from 'react';

const onClear = () => {
  window.desktopApi.clearAllEntries();
  setTimeout(() => {
    window.desktopApi.refreshEntries();
  });
};
export const ClearAll = ({
  disabled = false,
}: ClearAllProps): JSX.Element => (
  <Button
    disabled={ disabled }
    onClick={ onClear }
    startIcon={
      <DeleteIcon
        color='info'
        fontSize='medium'
      />
    }
    variant='outlined'
  >
    {'Clear All'}
  </Button>
);

export type ClearAllProps = {
  disabled?: boolean;
};
