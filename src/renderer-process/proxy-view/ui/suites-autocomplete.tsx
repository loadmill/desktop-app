import Autocomplete, { AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React, { useEffect } from 'react';

import { SuiteOption } from '../../../types/suite';

export const SuitesAutocomplete = ({
  suites = [],
  selectedSuite,
  setSelectedSuite,
  isFetchingSuites,
  onSearchSuites,
}: SuitesAutocompleteProps): JSX.Element => {
  const [suiteOptions, setSuiteOptions] = React.useState<SuiteOption[]>([]);

  useEffect(() => {
    setSuiteOptions(suites);
  }, [suites]);

  const onChange = (_event: React.SyntheticEvent, newValue: SuiteOption) => {
    setSelectedSuite(newValue);
  };

  const onSearch = (_event: React.SyntheticEvent, search: string, reason: AutocompleteInputChangeReason) => {
    // Don't search when the user selects an option
    if (reason === 'reset') {
      return;
    }

    onSearchSuites(search);
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

  const onRenderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: SuiteOption) => {
    return (
      <li
        { ...props }
        key={ option.id }
      >
        {option.id ? option.description : `Create "${option.description}"`}
      </li>
    );
  };

  return (
    <Autocomplete
      autoComplete
      disablePortal
      getOptionLabel={ (option: SuiteOption) => option.description }
      loading={ isFetchingSuites }
      onChange={ onChange }
      onInputChange={ onSearch }
      options={ suiteOptions }
      renderInput={ onRenderInput }
      renderOption={ onRenderOption }
      sx={ {
        width: 240,
      } }
      value={ selectedSuite || null }
    />
  );
};

export type SuitesAutocompleteProps = {
  isFetchingSuites: boolean;
  onSearchSuites: (search: string) => void;
  selectedSuite: SuiteOption | null;
  setSelectedSuite: (selectedSuite: SuiteOption | null) => void;
  suites: SuiteOption[];
};
