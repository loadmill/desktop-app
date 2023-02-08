import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useState } from 'react';

import { ViewValue } from '../../../types/views';

const toggleButtonStyle = {
  cursor: 'default',
  fontSize: 12,
};

export const ViewsSwitch = ({}: ViewsSwitchProps): JSX.Element => {
  const [view, setView] = useState<ViewValue>(ViewValue.WEB_PAGE);

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

export type ViewsSwitchProps = {};
