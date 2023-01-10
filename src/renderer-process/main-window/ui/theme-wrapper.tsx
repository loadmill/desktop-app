import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { LoadmillWebAppView } from './loadmill-web-app-view';
import { TitleBar } from './title-bar';

const darkTheme = createTheme({
  palette: {
    action: {
      active: '#bdd2e7',
    },
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
    <div
      className='app-container'
    >
      <TitleBar />
      <LoadmillWebAppView />
    </div>
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
