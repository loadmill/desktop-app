import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { Main } from './main';

const darkTheme = createTheme({
  palette: {
    background: {
      default: '#101e2c',
      paper: '#101e2c',
    },
    mode: 'dark',
    primary: {
      main: '#00B1FF',
    },
    text: {
      primary: '#bdd2e7',
    },
  }
});

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <CssBaseline />
    <Main />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
