import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { SyntheticEvent } from 'react';

import { ActionIconButton } from './actions-icon-buttons';

export const AgentButton = ({
  isAgentConnected,
  isStartAgentDisabled,
  shouldShowAgentLoader,
  tooltipTitle,
}: AgentButtonProps): JSX.Element => {
  return (
    <>
      {
        shouldShowAgentLoader ? (
          <AgentLoadingIconButton
            tooltipTitle={ tooltipTitle }
          />
        ) : isAgentConnected ? (
          <StopAgentIconButton
            onStopAgentClicked={ window.desktopApi.stopAgent }
          />
        ) : (
          <StartAgentIconButton
            disabled={ isStartAgentDisabled }
            onStartAgentClicked={ window.desktopApi.startAgent }
          />
        )
      }
    </>
  );
};

export type AgentButtonProps = {
  isAgentConnected: boolean;
  isStartAgentDisabled: boolean;
  shouldShowAgentLoader: boolean;
  tooltipTitle: string;
};

export const StartAgentIconButton: React.FC<StartAgentIconButtonProps> = ({
  disabled,
  onStartAgentClicked,
}) => {
  return (
    <div className='stop-start-agent'>
      <ActionIconButton
        disabled={ disabled }
        iconType='start'
        onActionClicked={ onStartAgentClicked }
        placement='left'
        tooltipTitle={
          disabled
            ? 'Agent is outdated'
            : 'Start Agent'
        }
      />
    </div>
  );
};

export type StartAgentIconButtonProps = {
  disabled?: boolean;
  onStartAgentClicked: (e: SyntheticEvent) => void;
};

export const StopAgentIconButton: React.FC<StopAgentIconButtonProps> = ({
  onStopAgentClicked,
}) => {
  return (
    <div className='stop-start-agent'>
      <ActionIconButton
        iconType='stop'
        onActionClicked={ onStopAgentClicked }
        placement='left'
        tooltipTitle='Stop Agent'
      />
    </div>
  );
};

export type StopAgentIconButtonProps = {
  onStopAgentClicked: (e: SyntheticEvent) => void;
};

export const AgentLoadingIconButton: React.FC<AgentLoadingIconButtonProps> = ({
  tooltipTitle: title,
}) => {
  return (
    <div className='stop-start-agent'>
      <div className='undraggable'>
        <Tooltip
          placement='left'
          title={ title }
        >
          <span>
            <IconButton
              disabled
              style={ { cursor: 'default' } }
            >
              <CircularProgress size={ 18 } />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export type AgentLoadingIconButtonProps = {
  tooltipTitle: string;
};
