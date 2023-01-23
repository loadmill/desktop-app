import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';

import { AccordionSummary } from './accordion-summary';

export const EntrySummary = ({
  method,
  status,
  url,
}: EntrySummaryProps): JSX.Element => {
  const theme = useTheme();

  return (
    <AccordionSummary>
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
      </div>
    </AccordionSummary>
  );
};

export type EntrySummaryProps = {
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
