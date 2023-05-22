import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { darkTheme } from '../../themes';

import { ProxyDashboard } from './proxy-dashboard';

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <CssBaseline />
    <ProxyDashboard />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
