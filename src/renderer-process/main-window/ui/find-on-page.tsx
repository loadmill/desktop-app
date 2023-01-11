import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

export const FindOnPage: React.FC<FindOnPageProps> = ({
  setShouldShowFind,
}): JSX.Element => {
  const [toFind, setToFind] = useState<string>('');

  const onChangeToFind = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    setToFind(e.target.value);
    window.desktopApi.findNext(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      window.desktopApi.findNext(toFind);
    } else if (e.key === 'Escape') {
      clearFindOnPage();
    }
  };

  const clearFindOnPage = () => {
    window.desktopApi.findNext('');
    setToFind('');
    setShouldShowFind(false);
  };

  return (
    <div className='find-on-page undraggable'>
      <TextField
        autoFocus
        fullWidth
        onChange={ onChangeToFind }
        onKeyDown={ onKeyDown }
        placeholder='Find In Page'
        size='small'
        type='search'
        value={ toFind }
        variant='outlined'
      />
    </div>
  );
};

export type FindOnPageProps = {
  setShouldShowFind: React.Dispatch<React.SetStateAction<boolean>>;
};
