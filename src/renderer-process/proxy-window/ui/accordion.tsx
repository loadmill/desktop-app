import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { styled } from '@mui/material/styles';
import React from 'react';

export const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    disableGutters
    elevation={ 0 }
    square
    { ...props }
  />
))(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  border: `1px solid ${theme.palette.divider}`,
}));
