import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';

import { ViewValue } from '../../../types/views';

const toggleButtonStyle = {
  cursor: 'default',
  fontSize: 12,
};

export const ViewsSwitch = ({
  setView,
  view,
}:ViewsSwitchProps): JSX.Element => {

  const onSelectView = (
    _event: React.MouseEvent<HTMLElement>,
    selectedView: ViewValue
  ) => {
    if (selectedView != null) {
      setView(selectedView);
      window.desktopApi.switchView(selectedView);
    }
  };

  return (
    <ToggleButtonGroup
      aria-label='Views'
      color='primary'
      exclusive
      onChange={ onSelectView }
      size='small'
      sx={ {
        height: '1.75rem',
      } }
      value={ view }
    >
      <ToggleButton
        sx={ toggleButtonStyle }
        value={ ViewValue.WEB_PAGE }
      >
        Loadmill
      </ToggleButton>
      <ToggleButton
        sx={ toggleButtonStyle }
        value={ ViewValue.PROXY }
      >
        Proxy
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export type ViewsSwitchProps = {
  setView: (view: ViewValue) => void;
  view: ViewValue;
};
