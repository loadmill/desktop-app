import AccordionDetails from '@mui/material/AccordionDetails';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React from 'react';

import { Body } from '../../../types/proxy-entry';

import { Accordion } from './accordion';
import { AccordionSummary } from './accordion-summary';
import { BodyContent } from './body-content';

export const BodyDetails = ({
  body,
}: BodyDetailsProps): JSX.Element => {
  const {
    mimeType,
    text,
  } = body;

  return (
    <Accordion>
      <AccordionSummary>
        <Typography>Body</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {
          !text && !mimeType ? (
            <Typography variant='subtitle2'>
              No body
            </Typography>
          ) : (
            <Card>
              <CardHeader
                title={
                  <Typography variant='subtitle2'>
                    {mimeType || 'No MIME type'}
                  </Typography>
                }
              />
              <Divider />
              <CardContent
                sx={ {
                  display: 'relative',
                } }
              >
                <BodyContent
                  body={ body }
                />
              </CardContent>
            </Card>
          )
        }
      </AccordionDetails>
    </Accordion>
  );
};

export type BodyDetailsProps = {
  body: Body;
};
