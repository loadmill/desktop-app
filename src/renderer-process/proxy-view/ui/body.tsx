import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { Body } from '../../../types/body';
import { DecodeState } from '../../../types/decode';

import { BodyContent } from './body-content';

export const BodyDetails = ({
  body,
}: BodyDetailsProps): JSX.Element => {
  const shouldDecode = body.encoding === 'base64';

  const [decodedState, setDecodedState] = useState<DecodeState>(shouldDecode ? DecodeState.DECODED : DecodeState.RAW);

  const onSelectDecodeState = (
    _event: React.MouseEvent<HTMLElement>,
    selectedState: DecodeState,
  ) => {
    if (selectedState != null) {
      setDecodedState(selectedState);
    }
  };

  const {
    mimeType,
    text,
  } = body;

  return (
    !text && !mimeType ? (
      <Typography variant='subtitle2'>
        No body
      </Typography>
    ) : (
      <Card>
        <CardHeader
          sx={ {
            bgcolor: theme => theme.palette.background.paper,
            p: '0px',
            paddingBottom: 1,
          } }
          title={
            <div
              style={ {
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
              } }
            >
              <Typography variant='subtitle2'>
                { mimeType || 'No MIME type' }
              </Typography>
              {
                shouldDecode &&
                  <>
                    <ToggleButtonGroup
                      aria-label='Views'
                      color='primary'
                      exclusive
                      onChange={ onSelectDecodeState }
                      size='small'
                      sx={ {
                        height: '1.75rem',
                      } }
                      value={ decodedState }
                    >
                      <ToggleButton
                        sx={ { fontSize: 12 } }
                        value={ DecodeState.DECODED }
                      >
                        {DecodeState.DECODED}
                      </ToggleButton>
                      <ToggleButton
                        sx={ { fontSize: 12 } }
                        value={ DecodeState.RAW }
                      >
                        { DecodeState.RAW }
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </>
              }
            </div>
          }
        />
        <Divider />
        <CardContent
          sx={ {
            '&:last-child': {
              paddingBottom: 4,
            },
            bgcolor: theme => theme.palette.background.paper,
            p: '8px',
          } }
        >
          <BodyContent
            body={ body }
            shouldDecode={ shouldDecode && decodedState === DecodeState.DECODED }
          />
        </CardContent>
      </Card>
    )
  );
};

export type BodyDetailsProps = {
  body: Body;
};
