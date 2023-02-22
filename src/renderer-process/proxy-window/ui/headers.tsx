import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import { Header } from '../../../types/header';

import { StyledTableCell, StyledTableRow } from './table-row-cell';

export const Headers = ({
  headers
}: HeadersProps): JSX.Element => {
  if (headers.length === 0) {
    return (
      <Typography component='span'>
        No headers
      </Typography>
    );
  }
  return (
    <TableContainer
      component={ Paper }
      sx={ {
        bgcolor: theme => theme.palette.background.paper,
        height: '100%',
        overflow: 'auto',
      } }
    >
      <Table
        size={ 'small' }
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell>Value</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {headers.map((header) => (
            <StyledTableRow
              hover
              key={ header.name }
              sx={ {
                bgcolor: (theme) => theme.palette.background.paper,
              } }
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

export type HeadersProps = {
  headers: Header[];
};
