import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
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
