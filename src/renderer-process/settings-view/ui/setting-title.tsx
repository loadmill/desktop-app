import Typography from '@mui/material/Typography';
import React from 'react';

export const SettingTitle = ({ title }: { title: string }): JSX.Element => (
  <Typography
    gutterBottom
    variant='h6'
  >
    {title}
  </Typography>
);
