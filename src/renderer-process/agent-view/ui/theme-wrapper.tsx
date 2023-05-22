import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { darkTheme } from '../../themes';

import { AgentLogs } from './agent-logs';

export const ThemeWrapper: React.FC<ThemeWrapperProps> = (): JSX.Element => (
  <ThemeProvider theme={ darkTheme }>
    <CssBaseline />
    <AgentLogs />
  </ThemeProvider>
);

export type ThemeWrapperProps = {};
