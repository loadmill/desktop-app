import React, { SyntheticEvent } from 'react';

import {
  StopIconButton,
} from './actions-icon-buttons';
import { Connected } from './connected';
import { LoadmillTitle } from './loadmill-title';

export const Header: React.FC<HeaderProps> = ({
  rightActionButton,
  leftActionButton,
  handleStop,
  isConnected,
}): JSX.Element => (
  <div
    style={ {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
    } }
  >
    { leftActionButton }
    <div
      style={ {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
      } }
    >
      <LoadmillTitle
        style={ { marginLeft: 28 } }
      />
      <Connected
        isConnected={ isConnected }
      />
    </div>
    <div>
      <StopIconButton
        isDisabled={ !isConnected }
        onStopClicked={ handleStop }
      />
      { rightActionButton }
    </div>
  </div>
);

export type HeaderProps = {
  handleStop: (_event: SyntheticEvent) => void;
  isConnected: boolean;
  leftActionButton: JSX.Element;
  rightActionButton: JSX.Element;
};
