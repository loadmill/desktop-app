import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import { alpha, Theme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { ProxyEntry } from '../../../types/proxy-entry';

import { ClearSelectedEntries } from './clear-selected';
import { EntryDetailsDrawer } from './entry-details-drawer';
import { ExportProxyAsHar } from './export-proxy-as-har';
import { MarkRelevant } from './mark-relevant';
import { StyledTableCell, StyledTableRow } from './table-row-cell';

export const ProxyEntries = ({
  entries,
  selectedEntriesActionsProps,
}: ProxyEntriesProps): JSX.Element => {
  const [activeEntry, setActiveEntry] = useState<ProxyEntry | undefined>(undefined);
  const [selected, setSelected] = useState<string[]>([]);

  const onSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (selected.length > 0) {
        resetSelected();
        return;
      }
      const newSelected = entries.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    resetSelected();
  };

  const onSelectEntry = (event: React.SyntheticEvent, id: string) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

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

  const resetSelected = () => {
    setSelected([]);
  };

  const resetActiveEntry = () => {
    setActiveEntry(undefined);
  };

  const resetActiveEntryOnCleared = () => {
    if (selected.some((id) => id === activeEntry?.id)) {
      resetActiveEntry();
    }
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const activeEntryIndex = entries.findIndex((entry) => entry.id === activeEntry?.id);
    if (activeEntryIndex === -1) {
      return;
    }
    if (event.key === 'ArrowDown') {
      if (activeEntryIndex === entries.length - 1) {
        return;
      }
      setActiveEntry(entries[activeEntryIndex + 1]);
    } else if (event.key === 'ArrowUp') {
      if (activeEntryIndex === 0) {
        return;
      }
      setActiveEntry(entries[activeEntryIndex - 1]);
    }
  };

  const onActiveEntryChange = (id: string) => {
    const isSameEntry = activeEntry?.id === id;
    isSameEntry ?
      resetActiveEntry() :
      setActiveEntry(entries.find((entry) => entry.id === id));
  };

  const onCloseDetailsDrawer = () => {
    resetActiveEntry();
  };

  return (
    <Paper
      sx={ {
        display: 'grid',
        gridTemplateRows: '1fr auto',
        height: '100%',
        mb: 2,
        overflow: 'hidden',
        width: '100%',
      } }
    >
      <div
        style={ {
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
        } }
      >
        <EnhancedTableToolbar
          numSelected={ selected.length }
          resetActiveEntryOnCleared={ resetActiveEntryOnCleared }
          resetSelected={ resetSelected }
          selectedEntries={ selected }
          selectedEntriesActionsProps={ selectedEntriesActionsProps }
        />
        <TableContainer
          sx={ {
            height: '100%',
            overflow: 'auto',
          } }
        >
          <Table
            aria-labelledby='tableTitle'
            size={ 'small' }
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={ selected.length }
              onSelectAllClick={ onSelectAllClick }
              rowCount={ entries.length }
            />
            <TableBody>
              {entries
                .map((entry, index) => {
                  const { id, irrelevant, request: { method, url }, response: { status }, timestamp } = entry;
                  const urlParts = new URL(url);
                  const path = urlParts.pathname;
                  const host = urlParts.hostname;

                  return (
                    <ProxyEntryRow
                      host={ host }
                      id={ id }
                      index={ index }
                      isActiveEntry={ activeEntry?.id === id }
                      isIrrelevant={ irrelevant }
                      isItemSelected={ isSelected(id as string) }
                      key={ id }
                      method={ method }
                      onActiveEntryChange={ onActiveEntryChange }
                      onKeyDown={ onKeyDown }
                      onSelectEntry={ onSelectEntry }
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
      </div>
      {
        activeEntry &&
        <EntryDetailsDrawer
          entry={ activeEntry }
          onClose={ onCloseDetailsDrawer }
        />
      }
    </Paper>
  );
};

export type ProxyEntriesProps = {
  entries: ProxyEntry[];
  selectedEntriesActionsProps?: {
    clear?: {
      resetSelected?: () => void;
      setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    };
    export?: {
      setShowExportAsHarSuccessSnackBar?: React.Dispatch<React.SetStateAction<boolean>>;
      showExportAsHarSuccessSnackBar?: boolean;
    };
  };
};

const EnhancedTableToolbar = ({
  numSelected,
  resetActiveEntryOnCleared,
  resetSelected,
  selectedEntries,
  selectedEntriesActionsProps,
}: EnhancedTableToolbarProps) => {
  const {
    clear: {
      setLoading,
    },
    export: {
      setShowExportAsHarSuccessSnackBar,
      showExportAsHarSuccessSnackBar,
    }
  } = selectedEntriesActionsProps;

  const exportEntriesAsHar = () => {
    window.desktopApi.exportAsHar(selectedEntries);
  };

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
      variant='dense'
    >
      {numSelected > 0 ? (
        <Typography
          color='inherit'
          component='div'
          sx={ { flex: '1 1 100%' } }
          variant='subtitle1'
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          component='div'
          id='tableTitle'
          sx={ { flex: '1 1 100%' } }
          variant='subtitle1'
        >
          Proxy Entries
        </Typography>
      )}

      {numSelected > 0 && (
        <div
          style={ {
            display: 'flex',
            gap: '8px',
          } }
        >
          <MarkRelevant
            resetActiveEntryOnCleared={ resetActiveEntryOnCleared }
            resetSelected={ resetSelected }
            selectedEntries={ selectedEntries }
            setLoading={ setLoading }
          />
          <ClearSelectedEntries
            resetActiveEntryOnCleared={ resetActiveEntryOnCleared }
            resetSelected={ resetSelected }
            selectedEntries={ selectedEntries }
            setLoading={ setLoading }
          />
          <ExportProxyAsHar
            onExport={ exportEntriesAsHar }
            openSnackBar={ showExportAsHarSuccessSnackBar }
            setOpenSnackBar={ setShowExportAsHarSuccessSnackBar }
          />
        </div>
      )}
    </Toolbar>
  );
};

type EnhancedTableToolbarProps = {
  numSelected?: number;
  resetActiveEntryOnCleared?: () => void;
  resetSelected?: () => void;
  selectedEntries?: string[];
  selectedEntriesActionsProps?: {
    clear?: {
      setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    };
    export?: {
      setShowExportAsHarSuccessSnackBar?: React.Dispatch<React.SetStateAction<boolean>>;
      showExportAsHarSuccessSnackBar?: boolean;
    };
  };
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};

const EnhancedTableHead = ({ onSelectAllClick, numSelected, rowCount }: EnhancedTableHeadProps) => {
  return (
    <TableHead>
      <TableRow>
        <StyledTableCell padding='checkbox'>
          <Checkbox
            checked={ rowCount > 0 && numSelected === rowCount }
            color='primary'
            indeterminate={ numSelected > 0 && numSelected < rowCount }
            inputProps={ {
              'aria-label': 'select all entries',
            } }
            onChange={ onSelectAllClick }
            size='small'
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
};

type EnhancedTableHeadProps = {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
}

const proxyEntriesHeadCells: readonly ProxyEntriesHeadCell[] = [
  {
    id: 'status',
    label: 'Status',
  },
  {
    id: 'method',
    label: 'Method',
  },
  {
    id: 'host',
    label: 'Host',
  },
  {
    id: 'path',
    label: 'Path',
  },
  {
    id: 'timestamp',
    label: 'Timestamp',
  },
];

type ProxyEntriesHeadCell = {
  id: keyof ProxyEntryRowProps;
  label: string;
}

const ProxyEntryRow = ({
  host,
  id,
  index,
  isActiveEntry,
  isIrrelevant,
  isItemSelected,
  method,
  onActiveEntryChange,
  onKeyDown,
  onSelectEntry,
  path,
  status,
  timestamp,
}: ProxyEntryRowProps): JSX.Element => {
  const labelId = `enhanced-table-checkbox-${index}`;
  return (
    <StyledTableRow
      aria-checked={ isItemSelected }
      hover
      onClick={ () => {
        onActiveEntryChange(id);
      } }
      onKeyDown={ onKeyDown }
      role='checkbox'
      selected={ isItemSelected }
      sx={ {
        bgcolor: (theme) => getRowBackgroundColor({ isActiveEntry }, theme),
        cursor: 'pointer',
        textDecoration: isIrrelevant ? 'line-through 0.13rem' : 'none',
      } }
      tabIndex={ -1 }
    >
      <StyledTableCell padding='checkbox'>
        <Checkbox
          checked={ isItemSelected }
          color='primary'
          inputProps={ {
            'aria-labelledby': labelId,
          } }
          onClick={ (event) => onSelectEntry(event, id as string) }
          size='small'
        />
      </StyledTableCell>
      <StyledTableCell
        component='th'
        id={ labelId }
        scope='row'
        sx={ {
          color: (theme) => colorStatus(Number(status), theme),
          width: '5%'
        } }
      >
        {status}
      </StyledTableCell>
      <StyledTableCell sx={ { width: '5%' } }>{method}</StyledTableCell>
      <StyledTableCell sx={ { width: '20%' } }>{host}</StyledTableCell>
      <StyledTableCell sx={ { width: '50%' } }>{path}</StyledTableCell>
      <StyledTableCell sx={ { width: '20%' } }>{timestamp}</StyledTableCell>
    </StyledTableRow>
  );
};

type ProxyEntryRowProps = {
  host: string;
  id: string;
  index: number;
  isActiveEntry: boolean;
  isIrrelevant?: boolean;
  isItemSelected: boolean;
  method: string;
  onActiveEntryChange: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSelectEntry: (event: React.SyntheticEvent, id: string) => void;
  path: string;
  status: string;
  timestamp: string;
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

const getRowBackgroundColor = ({ isActiveEntry }: Partial<ProxyEntryRowProps>, theme: Theme): string => {
  return isActiveEntry ?
    theme.palette.action.selected :
    theme.palette.background.paper;
};
