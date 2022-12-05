import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import React from 'react';

import loadmillLogo from './loadmill_logo.png';

export const LoadmillTitle: React.FC<LoadmillTitleProps> = ({ style }): JSX.Element => {
  return (
    <div
      style={ {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        ...style,
      } }
    >
      <Avatar
        src={ loadmillLogo }
        style={ { marginRight: 4 } }
      />
      <Typography
        variant='h4'
      >
        Loadmill Agent
      </Typography>
    </div>
  );
};

export type LoadmillTitleProps = {
  style?: React.CSSProperties;
};
