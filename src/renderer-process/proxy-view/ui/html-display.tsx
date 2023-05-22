import Typography from '@mui/material/Typography';
import prettyHTML from 'pretty';
import React from 'react';

const color = '#ffb482';

export const HtmlDisplay = ({
  html,
}: HtmlDisplayProps): JSX.Element => {
  const prettyHtml = prettyHTML(html, { ocd: true });

  return (
    <Typography
      className='html-display'
      color={ color }
      component='pre'
    >
      <code>{prettyHtml}</code>
    </Typography>
  );
};

export type HtmlDisplayProps = {
  html: string;
};
