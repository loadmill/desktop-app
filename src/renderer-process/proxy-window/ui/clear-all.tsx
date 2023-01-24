import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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

  <Tooltip
    title='Clear All'
  >
    <IconButton
      color='info'
      disabled={ disabled }
      onClick={ onClear }
    >
      <DeleteForeverOutlinedIcon fontSize='medium'/>
    </IconButton>
  </Tooltip>
);

export type ClearAllProps = {
  disabled?: boolean;
};
