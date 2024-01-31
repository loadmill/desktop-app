import TextField from '@mui/material/TextField';
import debounce from 'debounce';
import React, { useCallback } from 'react';

export const FilterRegex = ({
  filterRegex,
  setFilterRegex,
}: FilterRegexProps ): JSX.Element => {

  const debouncedSetFilterRegex = useCallback(
    debounce((filterRegex: string) => {
      window.desktopApi.setFilterRegex(filterRegex);
    }, 250),
    [],
  );

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFilterRegex(event.target.value);
    debouncedSetFilterRegex(event.target.value);
  };

  return (
    <TextField
      label='Filter (regex)'
      onChange={ onChange }
      placeholder='myapp.com/*'
      size='small'
      value={ filterRegex }
    />
  );
};

export type FilterRegexProps = {
  filterRegex?: string;
  setFilterRegex?: (filterRegex: string) => void;
};
