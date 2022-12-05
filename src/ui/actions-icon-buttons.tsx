import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ReadMoreOutlinedIcon from '@mui/icons-material/ReadMoreOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { SyntheticEvent } from 'react';

export const StopIconButton: React.FC<StopIconButtonProps> = ({
  isDisabled,
  onStopClicked,
}): JSX.Element => {
  return (
    <>
      <Tooltip
        placement='bottom'
        title='Stop Agent'
      >
        <span>
          <IconButton
            disabled={ isDisabled }
            onClick={ onStopClicked }
          >
            <StopCircleOutlinedIcon
              color={ isDisabled ? 'disabled' : 'primary' }
              fontSize='large'
            />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export type StopIconButtonProps = {
  isDisabled?: boolean;
  onStopClicked: (e: SyntheticEvent) => void;
};

export const ScrollToBottomIconButton: React.FC<ScrollToBottomIconProps> = ({
  onScrollToBottomClicked
}): JSX.Element => {
  return (
    <>
      <Tooltip
        placement='bottom'
        title='Scroll to bottom'
      >
        <span>
          <IconButton onClick={ onScrollToBottomClicked }>
            <ArrowCircleDownIcon
              color='primary'
              fontSize='large'
            />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export type ScrollToBottomIconProps = {
  onScrollToBottomClicked: (e: SyntheticEvent) => void;
};

export const GoToConsoleIconButton: React.FC<GoToConsoleIconButtonProps> = ({
  isDisabled,
  onGoToConsoleClicked
}): JSX.Element => {
  return (
    <>
      <Tooltip
        placement='bottom'
        title='See Logs'
      >
        <span>
          <IconButton
            disabled={ isDisabled }
            onClick={ onGoToConsoleClicked }
          >
            <ReadMoreOutlinedIcon
              color={ isDisabled ? 'disabled' : 'primary' }
              fontSize='large'
            />

          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export type GoToConsoleIconButtonProps = {
  isDisabled: boolean,
  onGoToConsoleClicked: (e: SyntheticEvent) => void
};

export const GoBackIconButton: React.FC<GoBackIconButtonProps> = ({
  onGoBackClicked,
}): JSX.Element => {
  return (
    <>
      <Tooltip
        placement='bottom'
        title='Back'
      >
        <span>
          <IconButton
            onClick={ onGoBackClicked }
          >
            <ArrowCircleLeftOutlinedIcon
              color='primary'
              fontSize='large'
            />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export type GoBackIconButtonProps = {
  onGoBackClicked: (e: SyntheticEvent) => void;
};
