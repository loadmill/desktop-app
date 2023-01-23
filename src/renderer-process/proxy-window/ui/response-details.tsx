import { AccordionDetails } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';

import { ProxyResponse } from '../../../types/proxy-entry';

import { Accordion } from './accordion';
import { AccordionSummary } from './accordion-summary';
import { BodyDetails } from './body';
import { Headers } from './headers';

export const ResponseDetails = ({
  response,
}: ResponseDetailsProps): JSX.Element => {
  const {
    body,
    headers,
  } = response;

  return (
    <>
      <Accordion>
        <AccordionSummary>
          <Typography>
            Response
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

export type ResponseDetailsProps = {
  response: ProxyResponse;
};
