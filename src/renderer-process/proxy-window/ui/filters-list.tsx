import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import { StyledList, StyledListItem } from './list-item';

export const FiltersList = ({
  filters,
}: FiltersListProps): JSX.Element => {
  return (
    <div
      className='filters-list'
    >
      <StyledList dense>
        {
          filters.map((filter) => (
            <StyledListItem
              className='show-when-hover-container'
              disableGutters
              divider
              secondaryAction={
                <IconButton
                  className='show-when-hover'
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
            </StyledListItem>
          ))
        }
      </StyledList>
    </div>
  );
};

export type FiltersListProps = {
  filters: string[];
};
