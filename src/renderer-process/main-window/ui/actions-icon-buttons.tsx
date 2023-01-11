import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopIcon from '@mui/icons-material/Stop';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { SyntheticEvent } from 'react';

type Icons = 'back' | 'forward' | 'refresh' | 'start' | 'stop';

const getIconFromName = (iconType: Icons): JSX.Element => {
  switch (iconType) {
    case 'back':
      return <ArrowBackIcon fontSize='small' />;
    case 'forward':
      return <ArrowForwardIcon fontSize='small' />;
    case 'refresh':
      return <RefreshIcon fontSize='small' />;
    case 'start':
      return <PlayArrowIcon fontSize='small' />;
    case 'stop':
      return <StopIcon fontSize='small' />;
  }
};

const ActionIconButton: React.FC<ActionsIconButtonsProps> = ({
  disabled,
  iconType,
  onActionClicked,
  placement,
  title,
}): JSX.Element => (
  <div className={ !disabled ? 'undraggable' : '' }>
    <Tooltip
      placement={ placement || 'right' }
      title={ title }
    >
      <span>
        <IconButton
          disabled={ disabled }
          onClick={ onActionClicked }
          style={ { cursor: 'default' } }
        >
          {getIconFromName(iconType)}
        </IconButton>
      </span>
    </Tooltip>
  </div>
);

export type ActionsIconButtonsProps = {
  disabled?: boolean;
  iconType: Icons;
  onActionClicked?: (...args: unknown[]) => void;
  placement?: 'bottom' | 'left' | 'right' | 'top';
  title?: string;
};

export const GoBackIconButton: React.FC<GoBackIconButtonProps> = ({
  disabled,
  onGoBackClicked,
}): JSX.Element => {
  return (
    <>
      <ActionIconButton
        disabled={ disabled }
        iconType='back'
        onActionClicked={ onGoBackClicked }
        title='Go back'
      />
    </>
  );
};

export type GoBackIconButtonProps = {
  disabled?: boolean;
  onGoBackClicked: (e: SyntheticEvent) => void;
};

export const GoForwardIconButton: React.FC<GoForwardIconButtonProps> = ({
  disabled,
  onGoForwardClicked,
}): JSX.Element => {
  return (
    <>
      <ActionIconButton
        disabled={ disabled }
        iconType='forward'
        onActionClicked={ onGoForwardClicked }
        title='Go Forward'
      />
    </>
  );
};

export type GoForwardIconButtonProps = {
  disabled?: boolean;
  onGoForwardClicked: (e: SyntheticEvent) => void
};

export const RefreshIconButton: React.FC<RefreshIconButtonProps> = ({
  onRefreshClicked,
}): JSX.Element => {
  return (
    <>
      <ActionIconButton
        iconType='refresh'
        onActionClicked={ onRefreshClicked }
        title='Refresh'
      />
    </>
  );
};

export type RefreshIconButtonProps = {
  onRefreshClicked: (e: SyntheticEvent) => void;
};

export const StartAgentIconButton: React.FC<StartAgentIconButtonProps> = ({
  onStartAgentClicked,
}) => {
  return (
    <div className='stop-start-agent'>
      <ActionIconButton
        iconType='start'
        onActionClicked={ onStartAgentClicked }
        placement='left'
        title='Start Agent'
      />
    </div>
  );
};

export type StartAgentIconButtonProps = {
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
        title='Stop Agent'
      />
    </div>
  );
};

export type StopAgentIconButtonProps = {
  onStopAgentClicked: (e: SyntheticEvent) => void;
};