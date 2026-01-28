import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { ActionIconButton } from './actions-icon-buttons';

export const AgentButton = ({
  isAgentButtonDisabled,
  isAgentConnected,
  shouldShowAgentLoader,
  tooltipTitle,
  onStartAgentClicked,
  onStopAgentClicked,
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
            disabled={ isAgentButtonDisabled }
            onStopAgentClicked={ onStopAgentClicked }
          />
        ) : (
          <StartAgentIconButton
            disabled={ isAgentButtonDisabled }
            onStartAgentClicked={ onStartAgentClicked }
          />
        )
      }
    </>
  );
};

export type AgentButtonProps = {
  isAgentButtonDisabled: boolean;
  isAgentConnected: boolean;
  onStartAgentClicked: () => void;
  onStopAgentClicked: () => void;
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
  onStartAgentClicked: () => void;
};

export const StopAgentIconButton: React.FC<StopAgentIconButtonProps> = ({
  disabled,
  onStopAgentClicked,
}) => {
  return (
    <div className='stop-start-agent'>
      <ActionIconButton
        disabled={ disabled }
        iconType='stop'
        onActionClicked={ onStopAgentClicked }
        placement='left'
        tooltipTitle='Stop Agent'
      />
    </div>
  );
};

export type StopAgentIconButtonProps = {
  disabled?: boolean;
  onStopAgentClicked: () => void;
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
