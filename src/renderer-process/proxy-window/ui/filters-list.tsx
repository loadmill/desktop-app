import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

export const FiltersList = ({
  filters,
}: FiltersListProps): JSX.Element => {
  return (
    <div
      className='filters-list'
    >
      <List dense>
        {
          filters.map((filter) => (
            <ListItem
              secondaryAction={
                <IconButton
                  onClick={ () => {
                    alert('delete');
                  } }
                >
                  <ClearIcon fontSize='small'/>
                </IconButton>
              }
            >
              <ListItemText
                primary={ filter }
              />
            </ListItem>
          ))
        }
      </List>
    </div>
  );
};

export type FiltersListProps = {
  filters: string[];
};
