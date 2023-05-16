import CircularProgress from '@mui/material/CircularProgress';
import React, { useEffect, useRef, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { AgentRendererMessage } from '../../../types/messaging';
import {
  INIT_AGENT_LOG,
  MESSAGE,
  STDERR,
  STDOUT
} from '../../../universal/constants';
import { textToNonEmptyLines } from '../../../universal/utils';

import { Console } from './console';

export const AgentLogs = (): JSX.Element => {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onAgentStdoutMsg = ({ text }: AgentRendererMessage['data']) => {
    if (text && (text.includes('[INFO]') || text.includes('[ERROR]'))) {
      const lines = textToNonEmptyLines(text);
      setLog(prevLog => [...prevLog, ...lines]);
    }
  };

  const onInitAgentLogMsg = (data: AgentRendererMessage['data']) => {
    if (data?.lines) {
      setLog(data.lines);
    }
    setIsLoading(false);
  };

  const onPreloadMessage = (event: MessageEvent<AgentRendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case STDOUT:
        case STDERR:
          onAgentStdoutMsg(data);
          break;
        case INIT_AGENT_LOG:
          onInitAgentLogMsg(data);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    window.desktopApi.initAgentLog();
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
    <>
      {isLoading ? (
        <CircularProgress
          className='log-loader'
          size={ 50 }
        />
      ) : (
        <Console
          log={ log }
          scrollRef={ scrollRef }
          scrollToBottom={ scrollToBottom }
        />
      )}
    </>
  );
};
