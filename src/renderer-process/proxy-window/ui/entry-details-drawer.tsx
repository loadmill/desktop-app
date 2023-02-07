import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Resizable } from 're-resizable';
import React from 'react';

import { Body } from '../../../types/body';
import { Header } from '../../../types/header';
import { ProxyEntry } from '../../../types/proxy-entry';

import { BodyDetails } from './body';
import { HeadersList } from './headers';

const placeHolderEntry: ProxyEntry = {
  id: '-1',
  request: {
    body: {
      text: '',
    },
    headers: [],
    method: 'GET',
    url: '',
  },
  response: {
    body: {
      text: '',
    },
    headers: [],
    status: 200,
  },
  timestamp: Date.now(),
};

export const EntryDetailsDrawer = ({
  entry = placeHolderEntry,
  onClose,
}: EntryDetailsDrawerProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Resizable
      defaultSize={ {
        height: '50%',
        width: '100%',
      } }
      enable={ {
        bottom: false,
        bottomLeft: false,
        bottomRight: false,
        left: false,
        right: false,
        top: true,
        topLeft: false,
        topRight: false,
      } }
      maxHeight={ '75%' }
      minHeight={ '25%' }
      style={ {
        background: theme.palette.background.paper,
        border: `1px solid ${ theme.palette.primary.main }`,
        bottom: 0,
        display: 'flex',
        position: 'absolute',
        zIndex: 1,
      } }
    >
      <div
        style={ {
          flex: 1,
          overflow: 'auto',
          paddingTop: 8,
        } }
      >
        <Typography
          align='center'
          style={ {
            paddingBottom: 8,
          } }
          variant='subtitle2'
        >
          Request
        </Typography>
        <BasicTabs
          body={ entry.request.body }
          headers={ entry.request.headers }
        />
      </div>
      <Divider
        flexItem
        orientation='vertical'
        variant='middle'
      />
      <Resizable
        defaultSize={ {
          height: '100%',
          width: '50%',
        } }
        enable={ {
          bottom: false,
          bottomLeft: false,
          bottomRight: false,
          left: true,
          right: false,
          top: false,
          topLeft: false,
          topRight: false,
        } }
        maxWidth={ '99.99%' }
        minWidth={ '0.01%' }
        style={ {
          overflow: 'auto',
          paddingTop: 8,
        } }
      >
        <Typography
          align='center'
          style={ {
            paddingBottom: 8,
          } }
          variant='subtitle2'
        >
          Response
        </Typography>
        <BasicTabs
          body={ entry.response.body }
          headers={ entry.response.headers }
        />
      </Resizable>
      <div
        style={ {
          position: 'relative',
        } }
      >
        <IconButton
          onClick={ onClose }
          size='small'
          sx={ {
            bgcolor: theme.palette.background.paper,
            position: 'absolute',
            right: 6,
            top: 6,
          } }
        >
          <CloseIcon
            fontSize='small'
          />
        </IconButton>
      </div>
    </Resizable>
  );
};

export type EntryDetailsDrawerProps = {
  entry: ProxyEntry;
  onClose: () => void;
};
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={ `simple-tab-${index}` }
      hidden={ value !== index }
      id={ `simple-tabpanel-${index}` }
      role='tabpanel'
      { ...other }
    >
      {value === index && (
        <Box sx={ { p: 3 } }>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    'aria-controls': `simple-tabpanel-${index}`,
    id: `simple-tab-${index}`,
  };
}

export const BasicTabs = ({
  headers,
  body,
}: BasicTabsProps): JSX.Element => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={ { width: '100%' } }>
      <Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
        <Tabs
          aria-label='entry-details-tabs'
          onChange={ handleChange }
          value={ value }
          variant='fullWidth'
        >
          <Tab
            label='HEADERS'
            { ...a11yProps(0) }
            // sx={ {
            //   fontSize: '14px',
            //   textTransform: 'none',
            // } }
          />
          <Tab
            label='BODY'
            { ...a11yProps(1) }
            // sx={ {
            //   fontSize: '14px',
            //   textTransform: 'none',
            // } }
          />
        </Tabs>
      </Box>
      <TabPanel
        index={ 0 }
        value={ value }
      >
        <HeadersList
          headers={ headers }
        />
      </TabPanel>
      <TabPanel
        index={ 1 }
        value={ value }
      >
        <BodyDetails
          body={ body }
        />
      </TabPanel>
    </Box>
  );
};

export type BasicTabsProps = {
  body: Body;
  headers: Header[];
};
