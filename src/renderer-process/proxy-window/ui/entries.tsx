import React from 'react';

import { ProxyEntry } from '../../../types/proxy-entry';

import { Entry } from './entry';

export const Entries = ({
  entries,
}: EntriesProps): JSX.Element => {
  return (
    <div>
      {entries.map((entry) => (
        <div
          key={ entry.id }
        >
          <Entry
            entry={ entry }
          />
        </div>
      ))}
    </div>
  );
};

export type EntriesProps = {
  entries: ProxyEntry[];
};
