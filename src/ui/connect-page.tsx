import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import React from 'react';

import { LINK_TO_LOADMILL_SECURITY } from '../constants';

import { PageType } from './page';

export const ConnectPage: React.FC<ConnectPageProps> = ({
  isConnected,
  setPage,
  setToken,
  token,
}): JSX.Element => {

  const handleChangeToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.api.startAgent(token);
    // setToken('');
    setPage('console');
  };

  return (
    <Container
      component='main'
      maxWidth='xs'
    >
      <Box
        sx={ {
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 8,
        } }
      >
        <ConnectForm
          handleChangeToken={ handleChangeToken }
          handleSubmit={ handleSubmit }
          isConnected={ isConnected }
          token={ token }
        />
      </Box>
    </Container>
  );
};

export type ConnectPageProps = {
  isConnected: boolean;
  setPage: React.Dispatch<React.SetStateAction<PageType>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  token: string;
};

const ConnectForm: React.FC<ConnectFormProps> = ({
  handleChangeToken,
  handleSubmit,
  isConnected,
  token,
}): JSX.Element => {
  return (
    <Box
      component='form'
      noValidate
      onSubmit={ handleSubmit }
      sx={ { mt: 1 } }
    >
      <TextField
        autoComplete='Token'
        autoFocus
        disabled={ isConnected }
        fullWidth
        id='token'
        label='Token'
        margin='normal'
        name='token'
        onChange={ handleChangeToken }
        type='password'
        value={ token }
      />
      <Button
        disabled={ isConnected || !token }
        fullWidth
        sx={ { mb: 2, mt: 3 } }
        type='submit'
        variant='contained'
      >
        Connect
      </Button>
      <Grid container>
        <Grid
          item
          xs
        >
          Need a Loadmill token? Click {' '}
          <Link
            href={ LINK_TO_LOADMILL_SECURITY }
            target='_blank'
            underline='hover'
          >
            here
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export type ConnectFormProps = {
  handleChangeToken: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isConnected: boolean;
  token: string;
};
