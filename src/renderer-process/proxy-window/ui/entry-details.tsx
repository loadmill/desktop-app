import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import React from 'react';

import { ProxyEntry } from '../../../types/proxy-entry';

import { RequestDetails } from './request-details';
import { ResponseDetails } from './response-details';

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  padding: theme.spacing(2),
}));

export const EntryDetails = ({
  entry,
}: EntryDetailsProps): JSX.Element => {
  const {
    request,
    response,
  } = entry;
  return (
    <AccordionDetails>
      <RequestDetails
        request={ request }
      />
      <ResponseDetails
        response={ response }
      />
    </AccordionDetails>
  );
};

export type EntryDetailsProps = {
  entry: ProxyEntry;
};
