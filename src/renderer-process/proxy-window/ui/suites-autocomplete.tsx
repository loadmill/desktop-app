import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React from 'react';

import { SuiteOption } from '../../../types/suite';

export const SuitesAutocomplete = ({
  suites = [],
}: SuitesAutocompleteProps): JSX.Element => (
  <Autocomplete
    autoComplete
    disablePortal
    getOptionLabel={ (option: SuiteOption) => option.description }
    onOpen={ window.desktopApi.fetchSuites }
    options={ suites }
    renderInput={
      (params) =>
        <TextField
          { ...params }
          label='Suite'
          size='small'
        />
    }
    sx={ {
      width: 240,
    } }
  />
);

export type SuitesAutocompleteProps = {
  suites?: SuiteOption[];
};
