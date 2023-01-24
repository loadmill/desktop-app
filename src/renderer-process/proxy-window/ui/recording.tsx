import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import Button from '@mui/material/Button';
import React from 'react';

export const Recording = ({
  isRecording = false,
}: RecordingProps): JSX.Element => {
  const text = isRecording ? 'Pause' : 'Start';
  const onClick = () => {
    window.desktopApi.setIsRecording(!isRecording);
  };
  return (
    <Button
      onClick={ onClick }
      startIcon={
        isRecording ?
          <PauseOutlinedIcon /> :
          <RecordingIcon />
      }
      variant='outlined'
    >
      {text}
    </Button>
  );
};

export type RecordingProps = {
  isRecording?: boolean;
};

const RecordingIcon = (): JSX.Element => {
  return (
    <FiberManualRecordIcon
      color='error'
      fontSize='small'
    />
  );
};
