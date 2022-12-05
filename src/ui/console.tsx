import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { Ref, useEffect } from 'react';

export const Console: React.FC<ConsoleProps> = ({
  log,
  scrollToBottom,
  scrollRef,
}): JSX.Element => {

  return (
    <>
      <ScrollableList
        log={ log }
        scrollRef={ scrollRef }
        scrollToBottom={ scrollToBottom }
      />
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
