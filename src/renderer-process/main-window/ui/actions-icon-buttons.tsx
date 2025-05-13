import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopIcon from '@mui/icons-material/Stop';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { SyntheticEvent } from 'react';

type Icons = 'back' | 'forward' | 'refresh' | 'start' | 'stop' | 'copy';

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
    case 'copy':
      return <ContentCopyIcon fontSize='small' />;
  }
};

const ActionIconButton = ({
  disabled,
  iconType,
  onActionClicked,
  placement,
  title,
}: ActionsIconButtonsProps): JSX.Element => (
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

export const GoBackIconButton = ({
  disabled,
  onGoBackClicked,
}: GoBackIconButtonProps): JSX.Element => {
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

export const GoForwardIconButton = ({
  disabled,
  onGoForwardClicked,
}: GoForwardIconButtonProps): JSX.Element => {
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

export const RefreshIconButton = ({
  disabled,
  onRefreshClicked,
}: RefreshIconButtonProps): JSX.Element => {
  return (
    <>
      <ActionIconButton
        disabled={ disabled }
        iconType='refresh'
        onActionClicked={ onRefreshClicked }
        title='Refresh'
      />
    </>
  );
};

export type RefreshIconButtonProps = {
  disabled?: boolean;
  onRefreshClicked: (e: SyntheticEvent) => void;
};

export const CopyIconButton = ({
  disabled,
  onCopyClicked,
  title,
}: CopyIconButtonProps): JSX.Element => {
  return (
    <ActionIconButton
      disabled={ disabled }
      iconType='copy'
      onActionClicked={ onCopyClicked }
      title={ title || 'Copy' }
    />
  );
};

export type CopyIconButtonProps = {
  disabled?: boolean;
  onCopyClicked: (e: SyntheticEvent) => void;
  title?: string;
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
        title={
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
        title='Stop Agent'
      />
    </div>
  );
};

export type StopAgentIconButtonProps = {
  onStopAgentClicked: (e: SyntheticEvent) => void;
};
