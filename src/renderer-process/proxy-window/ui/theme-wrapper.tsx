import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { ProxyDashboard } from './proxy-dashboard';

const darkTheme = createTheme({
  palette: {
    action: {
      selected: '#0c1824',
    },
    background: {
      default: '#101e2c',
      paper: '#101e2c',
    },
    error: {
      main: '#ff7878',
    },
    mode: 'dark',
    primary: {
      main: '#00B1FF',
    },
    success: {
      main: '#aae682',
    },
    text: {
      primary: '#bdd2e7',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <CssBaseline />
    <ProxyDashboard />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
