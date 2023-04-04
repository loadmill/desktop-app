import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Resizable } from 're-resizable';
import React, { useState } from 'react';

import { Body } from '../../../types/body';
import { Header } from '../../../types/header';
import { ProxyEntry } from '../../../types/proxy-entry';

import { BodyDetails } from './body';
import { Headers } from './headers';

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

const titleAndContentParentStyle = {
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
};

export const EntryDetailsDrawer = ({
  entry = placeHolderEntry,
  onClose,
}: EntryDetailsDrawerProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Resizable
      className='entry-details-drawer'
      defaultSize={ {
        height: '30vh',
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
      maxHeight={ '1000px' }
      maxWidth={ '100%' }
      minHeight={ '282px' }
      minWidth={ '100%' }
      style={ {
        background: theme.palette.background.paper,
        border: `1px solid ${ theme.palette.primary.main }`,
        display: 'flex',
      } }
    >
      <div
        style={ {
          flex: 1,
          ...titleAndContentParentStyle
        } }
      >
        <TitleAndContent
          body={ entry.request.body }
          headers={ entry.request.headers }
          title='REQUEST'
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
          ...titleAndContentParentStyle
        } }
      >
        <TitleAndContent
          body={ entry.response.body }
          headers={ entry.response.headers }
          title='RESPONSE'
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

export const TitleAndContent = ({
  body,
  headers,
  title,
}: TitleAndContentProps): JSX.Element => {
  return (
    <BasicTabs
      body={ body }
      headers={ headers }
      title={ title }
    />
  );
};

export type TitleAndContentProps = {
  body: Body;
  headers: Header[];
  title: 'REQUEST' | 'RESPONSE';
};

const tabStyle = {
  fontSize: '0.75rem',
  height: '40px',
  minHeight: 0,
  p: 0,
};

export const BasicTabs = ({
  body,
  headers,
  title,
}: BasicTabsProps): JSX.Element => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={ {
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        overflow: 'hidden',
        width: '100%',
      } }
    >
      <Box
        sx={ {
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: '8px',
          paddingLeft: '8px'
        } }
      >
        <Typography
          align='center'
          style={ {
            fontSize: '0.75rem',
            fontWeight: 'bold',
            paddingBottom: 0,
          } }
          variant='subtitle2'
        >
          { title }
        </Typography>
        <Tabs
          aria-label='entry-details-tabs'
          onChange={ handleChange }
          sx={ {
            height: '40px',
            minHeight: '40px',
          } }
          value={ value }
        >
          <Tab
            label='BODY'
            sx={ tabStyle }
          />
          <Tab
            label='HEADERS'
            sx={ tabStyle }
          />
        </Tabs>
      </Box>
      <TabPanel
        index={ 0 }
        value={ value }
      >
        <BodyDetails
          body={ body || {} }
        />
      </TabPanel>
      <TabPanel
        index={ 1 }
        value={ value }
      >
        <Headers
          headers={ headers }
        />
      </TabPanel>
    </Box>
  );
};

export type BasicTabsProps = TitleAndContentProps;

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={ value !== index }
      role='tabpanel'
      style={ {
        overflow: 'auto',
      } }
      { ...other }
    >
      {value === index && (
        <Box sx={ { p: 2 } }>
          { children }
        </Box>
      )}
    </div>
  );
};

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
}
