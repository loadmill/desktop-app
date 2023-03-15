import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';

export const SimpleJsonDisplay = ({
  prettyJsonText,
}: SimpleJsonDisplayProps): JSX.Element => {

  const theme = useTheme();

  return (
    <Typography
      color={ '#6eb450' || theme.palette.success.main }
      component='pre'
    >
      <code>{prettyJsonText}</code>
    </Typography>
  );
};

export type SimpleJsonDisplayProps = {
  prettyJsonText: string;
};
