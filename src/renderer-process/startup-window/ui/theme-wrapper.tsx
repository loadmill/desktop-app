import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { darkTheme } from '../../themes';

import { StartupScreen } from './startup-screen';

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <StartupScreen />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
