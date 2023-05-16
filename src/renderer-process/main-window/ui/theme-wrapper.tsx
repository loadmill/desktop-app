import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { darkTheme } from '../../themes';

import { LoadmillWebAppView } from './loadmill-web-app-view';
import { TitleBar } from './title-bar';

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
