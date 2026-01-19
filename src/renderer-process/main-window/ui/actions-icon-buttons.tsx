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

export const ActionIconButton = ({
  disabled,
  iconType,
  onActionClicked,
  placement,
  tooltipTitle,
}: ActionsIconButtonsProps): JSX.Element => (
  <div className={ !disabled ? 'undraggable' : '' }>
    <Tooltip
      placement={ placement || 'right' }
      title={ tooltipTitle }
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
  tooltipTitle?: string;
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
        tooltipTitle='Go back'
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
        tooltipTitle='Go Forward'
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
        tooltipTitle='Refresh'
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
  tooltipTitle,
}: CopyIconButtonProps): JSX.Element => {
  return (
    <ActionIconButton
      disabled={ disabled }
      iconType='copy'
      onActionClicked={ onCopyClicked }
      tooltipTitle={ tooltipTitle || 'Copy' }
    />
  );
};

export type CopyIconButtonProps = {
  disabled?: boolean;
  onCopyClicked: (e: SyntheticEvent) => void;
  tooltipTitle?: string;
};
