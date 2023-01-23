import { AccordionDetails } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

import { ProxyRequest } from '../../../types/proxy-entry';

import { Accordion } from './accordion';
import { AccordionSummary } from './accordion-summary';
import { BodyDetails } from './body';
import { Headers } from './headers';

export const RequestDetails = ({
  request,
}: RequestDetailsProps): JSX.Element => {

  const {
    body,
    headers,
  } = request;

  return (
    <>
      <Accordion>
        <AccordionSummary>
          <Typography>
            Request
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {
            headers &&
              <Headers
                headers={ headers }
              />
          }
          {
            body &&
              <BodyDetails
                body={ body }
              />
          }
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export type RequestDetailsProps = {
  request: ProxyRequest;
};
