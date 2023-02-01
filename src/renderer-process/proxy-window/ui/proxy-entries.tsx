import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { alpha, Theme, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';

import { ProxyEntry } from '../../../types/proxy-entry';

import { StyledTableCell } from './table-row-cell';

export type ProxyEntriesProps = {
  entries: ProxyEntry[];
};

type ProxyEntryRowProps = {
  host: string;
  id: string;
  index: number;
  isItemSelected: boolean;
  method: string;
  onClick: (event: React.SyntheticEvent, id: string) => void;
  path: string;
  status: string;
  timestamp: string;
};

type ProxyEntriesHeadCell = {
  disablePadding: boolean;
  id: keyof ProxyEntryRowProps;
  label: string;
}

const proxyEntriesHeadCells: readonly ProxyEntriesHeadCell[] = [
  {
    disablePadding: false,
    id: 'status',
    label: 'Status',
  },
  {
    disablePadding: false,
    id: 'method',
    label: 'Method',
  },
  {
    disablePadding: false,
    id: 'host',
    label: 'Host',
  },
  {
    disablePadding: false,
    id: 'path',
    label: 'Path',
  },
  {
    disablePadding: false,
    id: 'timestamp',
    label: 'Timestamp',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
}

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount }: EnhancedTableProps) {
  return (
    <TableHead>
      <TableRow>
        <StyledTableCell padding="checkbox">
          <Checkbox
            checked={ rowCount > 0 && numSelected === rowCount }
            color="primary"
            indeterminate={ numSelected > 0 && numSelected < rowCount }
            inputProps={ {
              'aria-label': 'select all desserts',
            } }
            onChange={ onSelectAllClick }
          />
        </StyledTableCell>
        {proxyEntriesHeadCells.map((headCell) => (
          <StyledTableCell
            align={ 'left' }
            key={ headCell.id }
          >
            { headCell.label }
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={ {
        pl: { sm: 2 },
        pr: { sm: 1, xs: 1, },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      } }
    >
      {numSelected > 0 ? (
        <Typography
          color="inherit"
          component="div"
          sx={ { flex: '1 1 100%' } }
          variant="subtitle1"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          component="div"
          id="tableTitle"
          sx={ { flex: '1 1 100%' } }
          variant="h6"
        >
          Proxy Entries
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export const ProxyEntries = ({
  entries,
}: ProxyEntriesProps): JSX.Element => {
  const [selected, setSelected] = React.useState<readonly string[]>([]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = entries.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const onClick = (_event: React.SyntheticEvent, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  return (
    <Box sx={ { width: '100%' } }>
      <Paper sx={ { mb: 2, width: '100%', } }>
        <EnhancedTableToolbar numSelected={ selected.length } />
        <TableContainer
          sx={ { height: '100vh' } }
        >
          <Table
            aria-labelledby="tableTitle"
            size={ 'small' }
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={ selected.length }
              onSelectAllClick={ handleSelectAllClick }
              rowCount={ entries.length }
            />
            <TableBody>
              {entries
                .map((entry, index) => {
                  const { id, request: { method, url }, response: { status }, timestamp } = entry;
                  const urlParts = new URL(url);
                  const path = urlParts.pathname;
                  const host = urlParts.hostname;

                  return (
                    <ProxyEntryRow
                      host={ host }
                      id={ id }
                      index={ index }
                      isItemSelected={ isSelected(id as string) }
                      method={ method }
                      onClick={ onClick }
                      path={ path }
                      status={ String(status) }
                      timestamp={ new Date(timestamp).toISOString().replace('T', ' ').substring(0, 23) }
                    />
                  );
                }
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const ProxyEntryRow = ({
  host,
  id,
  index,
  isItemSelected,
  method,
  onClick,
  path,
  status,
  timestamp,
}: ProxyEntryRowProps): JSX.Element => {
  const theme = useTheme();
  const labelId = `enhanced-table-checkbox-${index}`;
  return (
    <TableRow
      aria-checked={ isItemSelected }
      hover
      key={ id }
      onClick={ (event) => onClick(event, id as string) }
      role="checkbox"
      selected={ isItemSelected }
      tabIndex={ -1 }
    >
      <StyledTableCell padding="checkbox">
        <Checkbox
          checked={ isItemSelected }
          color="primary"
          inputProps={ {
            'aria-labelledby': labelId,
          } }
        />
      </StyledTableCell>
      <StyledTableCell
        component="th"
        id={ labelId }
        scope="row"
        sx={ {
          color: colorStatus(Number(status), theme),
          width: '5%'
        } }
      >
        {status}
      </StyledTableCell>
      <StyledTableCell sx={ { width: '5%' } }>{method}</StyledTableCell>
      <StyledTableCell sx={ { width: '20%' } }>{host}</StyledTableCell>
      <StyledTableCell sx={ { width: '50%' } }>{path}</StyledTableCell>
      <StyledTableCell sx={ { width: '20%' } }>{timestamp}</StyledTableCell>
    </TableRow>
  );
};

const colorStatus = (status: number, theme: Theme): string => {
  if (101 <= status && status < 400) {
    return theme.palette.success.main;
  }

  if (400 <= status) {
    return 'red';
  }

  return 'yellow';
};
