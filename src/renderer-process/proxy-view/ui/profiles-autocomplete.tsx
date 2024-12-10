import Autocomplete, {
  AutocompleteInputChangeReason,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React, { useEffect } from 'react';

export const ProfilesAutocomplete = ({
  profiles = [],
  selectedProfile,
  onSelectProfile,
  isFetchingProfiles,
  onSearchProfiles,
}: ProfilesAutocompleteProps): JSX.Element => {
  const [profileOptions, setProfileOptions] = React.useState<string[]>([]);

  useEffect(() => {
    setProfileOptions(profiles);
  }, [profiles]);

  const onChange = (_event: React.SyntheticEvent, newValue: string) => {
    onSelectProfile(newValue);
  };

  const onSearch = (_event: React.SyntheticEvent, search: string, reason: AutocompleteInputChangeReason) => {
    // Don't search when the user selects an option
    if (reason === 'reset') {
      return;
    }

    onSearchProfiles(search);
  };

  const onRenderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        { ...params }
        label='Profile'
        size='small'
      />
    );
  };

  return (
    <Autocomplete
      autoComplete
      disablePortal
      getOptionLabel={ (option: string) => option }
      loading={ isFetchingProfiles }
      onChange={ onChange }
      onInputChange={ onSearch }
      options={ profileOptions }
      renderInput={ onRenderInput }
      sx={ {
        width: 240,
      } }
      value={ selectedProfile || null }
    />
  );
};

export type ProfilesAutocompleteProps = {
  isFetchingProfiles: boolean;
  onSearchProfiles: (search: string) => void;
  onSelectProfile: (selectedProfile: string | null) => void;
  profiles: string[];
  selectedProfile: string | null;
};
