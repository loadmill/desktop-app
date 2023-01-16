import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import React from 'react';

import { FiltersList } from './filters-list';

export const Filters = ({
  filters,
}: FiltersProps ): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const [newFilter, setNewFilter] = React.useState<string>('');

  const onOpenFiltersDialog = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFilterChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setNewFilter(event.target.value);
  };

  const onAdd = () => {
    console.log('add filter', [...filters, newFilter]);
    window.desktopApi.setFilters(
      [...filters, newFilter]
    );
    setNewFilter('');
    refreshFilters();
    onClose();
  };

  const refreshFilters = () => {
    window.desktopApi.refreshFilters();
  };

  return (
    <>
      <Button
        className='fit-content'
        onClick={ onOpenFiltersDialog }
        variant='outlined'
      >
        Filters
      </Button>
      <Dialog
        PaperProps={ { style: { minWidth: '50%' } } }
        onClose={ onClose }
        open={ open }
      >
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <AddFilter
            newFilter={ newFilter }
            onAdd={ onAdd }
            onFilterChange={ onFilterChange }
          />
          <FiltersList
            filters={ filters }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={ onClose }>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export type FiltersProps = {
  filters: string[];
};

const AddFilter = ({
  newFilter,
  onAdd,
  onFilterChange,
}: AddFilterProps): JSX.Element => (
  <div>
    <DialogContentText>
      Add a url or part of it to filter it out
    </DialogContentText>
    <div
      style={ { display: 'flex', justifyContent: 'space-between' } }
    >
      <TextField
        autoFocus
        fullWidth
        margin='dense'
        onChange={ onFilterChange }
        placeholder='google-analytics.com'
        type='email'
        value={ newFilter }
        variant='standard'
      />
      <IconButton onClick={ onAdd }>
        <AddIcon/>
      </IconButton>
    </div>
  </div>
);

type AddFilterProps = {
  newFilter: string;
  onAdd: () => void;
  onFilterChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};
