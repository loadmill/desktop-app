import CssBaseline from '@mui/material/CssBaseline';
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { ProxyDashboard } from './proxy-dashboard';

const darkTheme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            backgroundColor: alpha('#00B1FF', 0.08),
            borderColor: '#00B1FF',
          },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: alpha('#00B1FF', 0.5),
          },
        },
      },
    },
  },
  palette: {
    action: {
      active: '#bdd2e7',
      selected: '#305a84',
    },
    background: {
      default: '#101e2c',
      paper: '#101e2c',
    },
    error: {
      main: '#ff7878',
    },
    info: {
      main: '#bdd2e7',
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
