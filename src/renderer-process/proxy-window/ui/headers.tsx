import AccordionDetails from '@mui/material/AccordionDetails';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import { Header } from '../../../types/header';

import { Accordion } from './accordion';
import { AccordionSummary } from './accordion-summary';
import { StyledTableCell, StyledTableRow } from './table-row-cell';

export const Headers = ({
  headers,
}: HeadersProps): JSX.Element => (
  <>
    <Accordion>
      <AccordionSummary>
        <Typography>Headers</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <HeadersList
          headers={ headers }
        />

      </AccordionDetails>
    </Accordion>
  </>
);

export type HeadersProps = {
  headers: Header[];
};

export const HeadersList = ({
  headers
}: HeadersProps): JSX.Element => {
  if (headers.length === 0) {
    return (
      <Typography>
        No headers
      </Typography>
    );
  }
  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell>Value</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {headers.map((header) => (
            <StyledTableRow
              key={ header.name }
            >
              <StyledTableCell>{header.name}</StyledTableCell>
              <StyledTableCell>{header.value}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
