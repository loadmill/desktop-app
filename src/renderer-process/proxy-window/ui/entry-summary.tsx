import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';

import { AccordionSummary } from './accordion-summary';

export const EntrySummary = ({
  id,
  method,
  status,
  url,
}: EntrySummaryProps): JSX.Element => {
  const theme = useTheme();

  const onDeleteEntry = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    window.desktopApi.deleteEntry(id);
    setTimeout(() => {
      window.desktopApi.refreshEntries();
    });
  };

  return (
    <AccordionSummary
      className='show-when-hover-container'
    >
      <div
        className='entry-summary'
      >
        <Typography
          color={ colorStatus(status, theme) }
        >
          {status}
        </Typography>
        <Typography>{method}</Typography>
        <Typography
          className='url'
        >
          {url}
        </Typography>
        <IconButton
          className='show-when-hover'
          onClick={ onDeleteEntry }
        >
          <ClearIcon fontSize='small'/>
        </IconButton>
      </div>
    </AccordionSummary>
  );
};

export type EntrySummaryProps = {
  id: string;
  method: string;
  status: number;
  url: string;
};

const colorStatus = (status: number, theme: Theme): string => {
  if (101 <= status && status < 400) {
    return theme.palette.success.main;
  }

  if (400 <= status) {
    return 'red';
  }

  return 'yellow';
};
