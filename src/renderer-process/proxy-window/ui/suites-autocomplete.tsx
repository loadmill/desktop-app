import Autocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React from 'react';

import { SuiteOption } from '../../../types/suite';

export const SuitesAutocomplete = ({
  suites = [],
  selectedSuiteId,
  setSelectedSuiteId,
}: SuitesAutocompleteProps): JSX.Element => {

  const onChange = (_event: React.SyntheticEvent, newValue: SuiteOption) => {
    setSelectedSuiteId(newValue.id);
  };

  const onRenderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        { ...params }
        label='Suite'
        size='small'
      />
    );
  };

  return (
    <Autocomplete
      autoComplete
      disablePortal
      getOptionLabel={ (option: SuiteOption) => option.description }
      onChange={ onChange }
      onOpen={ window.desktopApi.fetchSuites }
      options={ suites }
      renderInput={ onRenderInput }
      sx={ {
        width: 240,
      } }
      value={ selectedSuiteId }
    />
  );
};

export type SuitesAutocompleteProps = {
  selectedSuiteId?: string;
  setSelectedSuiteId?: (suiteId: string) => void;
  suites?: SuiteOption[];
};
