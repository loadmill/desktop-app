import HelpOutlineSharpIcon from '@mui/icons-material/HelpOutlineSharp';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { LINK_TO_PROXY_DOCS } from '../../../universal/constants';

export const LinkToProxyDocs: React.FC<LinkToProxyDocsProps> = (): JSX.Element => (
  <Tooltip
    title='Documentation'
  >
    <span>
      <Link
        href={ LINK_TO_PROXY_DOCS }
        target='_blank'
      >
        <IconButton>
          <HelpOutlineSharpIcon />
        </IconButton>
      </Link>
    </span>
  </Tooltip>
);

export type LinkToProxyDocsProps = {};
