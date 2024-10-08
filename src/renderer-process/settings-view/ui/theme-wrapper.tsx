import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { darkTheme } from '../../themes';

import { SettingsPage } from './settings-page';

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <CssBaseline />
    <SettingsPage />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
