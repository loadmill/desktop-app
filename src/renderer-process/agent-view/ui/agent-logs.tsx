import React, { useEffect, useRef, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { AgentRendererMessage } from '../../../types/messaging';
import {
  MESSAGE,
  STDERR,
  STDOUT,
} from '../../../universal/constants';
import { textToNonEmptyLines } from '../../../universal/utils';

import { Console } from './console';

export const AgentLogs = (): JSX.Element => {
  const [log, setLog] = useState<string[]>([]);

  const onAgentStdoutMsg = ({ text }: AgentRendererMessage['data']) => {
    if (text && (text.includes('[INFO]') || text.includes('[ERROR]'))) {
      const lines = textToNonEmptyLines(text);
      setLog(prevLog => [...prevLog, ...lines]);
    }
  };

  const onPreloadMessage = (event: MessageEvent<AgentRendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case STDOUT:
        case STDERR:
          onAgentStdoutMsg(data);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);

    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  const scrollRef = useRef(null);

  const scrollToBottom = (): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behaviour: 'smooth' });
    }
  };

  return (
    <Console
      log={ log }
      scrollRef={ scrollRef }
      scrollToBottom={ scrollToBottom }
    />
  );
};
