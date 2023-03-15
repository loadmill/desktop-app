import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';
import React from 'react';

export const MarkRelevant = ({
  disabled = false,
  resetActiveEntryOnCleared = () => { },
  resetSelected = () => { },
  selectedEntries = [],
  setLoading = (_b: boolean) => { },
}: MarkRelevantProps): JSX.Element => {

  const onMarkRelevant = (selectedEntries: string[]) => {
    setLoading(true);
    resetSelected();
    resetActiveEntryOnCleared();
    window.desktopApi.markRelevant(selectedEntries);
  };

  return (
    <Button
      disabled={ disabled }
      onClick={ () => onMarkRelevant(selectedEntries) }
      startIcon={
        <RestoreIcon
          color='primary'
          fontSize='medium'
        />
      }
      variant='outlined'
    >
      {'Restore'}
    </Button>
  );
};

export type MarkRelevantProps = {
  disabled?: boolean;
  resetActiveEntryOnCleared?: () => void;
  resetSelected?: () => void;
  selectedEntries?: string[];
  setLoading?: (loading: boolean) => void;
};
