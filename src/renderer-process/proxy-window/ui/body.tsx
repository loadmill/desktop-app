import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React from 'react';

import { Body } from '../../../types/body';

import { BodyContent } from './body-content';

export const BodyDetails = ({
  body,
}: BodyDetailsProps): JSX.Element => {
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
            p: '8px',
          } }
          title={
            <Typography variant='subtitle2'>
              {mimeType || 'No MIME type'}
            </Typography>
          }
        />
        <Divider />
        <CardContent
          sx={ {
            bgcolor: theme => theme.palette.background.paper,
            display: 'relative',
          } }
        >
          <BodyContent
            body={ body }
          />
        </CardContent>
      </Card>
    )
  );
};

export type BodyDetailsProps = {
  body: Body;
};
