import React from 'react';

import { ProxyEntry } from '../../../types/proxy-entry';

import { Accordion } from './accordion';
import { EntryDetails } from './entry-details';
import { EntrySummary } from './entry-summary';

export const Entry = ({
  entry,
}: EntryProps): JSX.Element => (
  <>
    <CustomizedAccordions
      entry={ entry }
    />
  </>
);

export type EntryProps = {
  entry: ProxyEntry;
};

export default function CustomizedAccordions({
  entry
}: CustomizedAccordionsProps): JSX.Element {
  return (
    <>
      <Accordion>
        <EntrySummary
          method={ entry.request.method }
          status={ entry.response.status }
          url={ entry.request.url }
        />
        <EntryDetails
          entry={ entry }
        />
      </Accordion>
    </>
  );
}

export type CustomizedAccordionsProps = {
  entry: ProxyEntry;
};
