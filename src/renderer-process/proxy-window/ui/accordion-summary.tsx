import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import React from 'react';

export const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={ <ArrowForwardIosSharpIcon sx={ { fontSize: '0.9rem' } } /> }
    { ...props }
  />
))(({ theme }) => {
  return ({
    '& .MuiAccordionSummary-content': {
      alignItems: 'start',
      display: 'flex',
      justifyContent: 'space-between',
      marginLeft: theme.spacing(1),
    },
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
    '&:active': {
      backgroundColor: theme.palette.action.selected,
    },
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
  });
});
