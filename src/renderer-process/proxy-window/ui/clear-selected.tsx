import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import React from 'react';

export const ClearSelectedEntries = ({
  disabled = false,
  resetActiveEntryOnCleared = () => {},
  resetSelected = () => {},
  selectedEntries = [],
  setLoading = (_b: boolean) => {},
}: ClearSelectedProps): JSX.Element => {

  const onClear = (selectedEntries: string[]) => {
    setLoading(true);
    resetSelected();
    resetActiveEntryOnCleared();
    window.desktopApi.deleteEntries(selectedEntries);
  };

  return (
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
};

export type ClearSelectedProps = {
  disabled?: boolean;
  resetActiveEntryOnCleared?: () => void;
  resetSelected?: () => void;
  selectedEntries?: string[];
  setLoading?: (loading: boolean) => void;
};
