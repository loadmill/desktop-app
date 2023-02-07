import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import React from 'react';

const onClear = (selectedEntries: string[]) => {
  window.desktopApi.deleteEntry(selectedEntries[0]);
  setTimeout(() => {
    window.desktopApi.refreshEntries();
  });
};

export const ClearSelectedEntries = ({
  disabled = false,
  selectedEntries = [],
}: ClearSelectedProps): JSX.Element => (
  <Button
    disabled={ disabled }
    onClick={ () => onClear(selectedEntries) }
    startIcon={
      <DeleteIcon
        color='primary'
        fontSize='medium'
      />
    }
    variant='outlined'
  >
    {'Clear'}
  </Button>
);

export type ClearSelectedProps = {
  disabled?: boolean;
  selectedEntries?: string[];
};
