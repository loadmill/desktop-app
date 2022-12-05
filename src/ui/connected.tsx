import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { CONNECTED, DISCONNECTED } from '../constants';

export const Connected: React.FC<ConnectedProps> = ({ isConnected }): JSX.Element => {
  return (
    <Tooltip
      title={ isConnected ? CONNECTED : DISCONNECTED }
    >
      {
        isConnected ?
          <CloudDoneIcon
            color='success'
            style={ { marginLeft: 16 } }
          />
          :
          <CloudOffIcon
            style={ { marginLeft: 16 } }
          />
      }
    </Tooltip>
  );
};

export type ConnectedProps = {
  isConnected: boolean;
};
