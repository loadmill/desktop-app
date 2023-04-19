import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';

export const CustomizedSnackbars = ({
  message,
  onClose,
  open = false,
  severity = 'info',
}: CustomizedSnackbarsProps): JSX.Element => {
  return (
    <>
      <Snackbar
        autoHideDuration={ 6000 }
        onClose={ onClose }
        open={ open }
      >
        <Alert
          onClose={ onClose }
          severity={ severity }
          sx={ { width: '100%' } }
        >
          { message }
        </Alert>
      </Snackbar>
    </>
  );
};

export type CustomizedSnackbarsProps = {
  message: string;
  onClose?: () => void;
  open?: boolean;
  severity?: AlertColor;
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return (
    <MuiAlert
      elevation={ 6 }
      ref={ ref }
      variant='filled'
      { ...props }
    />
  );
});
