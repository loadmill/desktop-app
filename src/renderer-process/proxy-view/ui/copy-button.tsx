import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

export const CopyButton = ({ sx, text = '' }: { sx?: SxProps<Theme>, text: string }): JSX.Element => {
  return (
    <IconButton
      onClick={ () => navigator.clipboard.writeText(text) }
      sx={ sx }
    >
      <ContentCopyIcon
        fontSize='small'
      />
    </IconButton>
  );
};

export type CopyButtonProps = {
  sx?: SxProps<Theme>;
  text: string;
};
