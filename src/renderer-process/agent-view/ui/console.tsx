import ExpandCircleDown from '@mui/icons-material/ExpandCircleDown';
import { IconButton, Tooltip } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { Ref, useEffect, useState } from 'react';

import { DownloadIconButton } from '../../proxy-view/ui/download-icon-button';

export const Console: React.FC<ConsoleProps> = ({
  log,
  scrollToBottom,
  scrollRef,
}): JSX.Element => {
  const [isScrolledAtBottom, setIsScrolledAtBottom] = useState<boolean>(true);

  let scrollDebounce: NodeJS.Timeout;

  const handleScroll = () => {
    clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(() => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
      const isAtBottom = scrollHeight - scrollTop === clientHeight;
      setIsScrolledAtBottom(isAtBottom);
    }, 100);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className='download-agent-log-section'>
        <p> To view former log entries download the agent log file</p>
        <DownloadIconButton
          onDownload={ window.desktopApi.downloadAgentLog }
          tooltip='Download agent log file'
        />
      </div>

      <ScrollableList
        log={ log }
        scrollRef={ scrollRef }
        scrollToBottom={ scrollToBottom }
      />
      <div className='scroll-to-bottom-button'>
        <Tooltip title='Scroll to bottom' >
          <span>
            <IconButton
              disabled={ isScrolledAtBottom }
              onClick={ scrollToBottom }
            >
              <ExpandCircleDown fontSize='large'/>
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </>
  );
};

export function ScrollableList({
  log,
  scrollToBottom,
  scrollRef,
}: {
  log: string[];
  scrollRef: Ref<HTMLLIElement>;
  scrollToBottom: () => void;
}): JSX.Element {

  useEffect(() => {
    scrollToBottom();
  }, [log, scrollToBottom]);

  return (
    <List dense>
      {log.map((l, i) => (
        <LogEvent
          event={ l }
          key={ i }
        />
      ))}
      <ListItem
        ref={ scrollRef }
      />
    </List>
  );
}

const LogEvent = ({ event }: { event: string; }): JSX.Element => {
  const eventColor = event.includes('[INFO]') ?
    '#aae682' :
    event.includes('[ERROR]') ?
      '#ff7878' :
      'inherit';
  return (
    <ListItem >
      <ListItemText
        primary={
          <span
            style={ {
              color: eventColor,
              fontFamily: 'monospace',
            } }
          >
            {event}
          </span>
        }
      />
    </ListItem>
  );
};

export type ConsoleProps = {
  log: string[];
  scrollRef: Ref<HTMLLIElement>;
  scrollToBottom: () => void;
};
