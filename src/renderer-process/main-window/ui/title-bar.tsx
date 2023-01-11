import React, {
  MouseEvent,
  SyntheticEvent,
  useEffect,
  useState
} from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { RendererMessage } from '../../../types/messaging';
import {
  IS_AGENT_CONNECTED,
  MESSAGE,
  NAVIGATION,
  SHOW_FIND_ON_PAGE,
} from '../../../universal/constants';

import { GoBackIconButton, GoForwardIconButton, RefreshIconButton, StartAgentIconButton, StopAgentIconButton } from './actions-icon-buttons';
import { FindOnPage } from './find-on-page';

export const TitleBar: React.FC<TitleBarProps> = (): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [shouldShowFind, setShouldShowFind] = useState<boolean>(false);
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);
    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  const onPreloadMessage = (event: MessageEvent<RendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case NAVIGATION:
          onNavigationMsg(data);
          break;
        case SHOW_FIND_ON_PAGE:
          onShowFindMsg(data);
          break;
        case IS_AGENT_CONNECTED:
          onIsAgentConnectedMsg(data);
          break;
        default:
          break;
      }
    }
  };

  const onNavigationMsg = (data: RendererMessage['data']) => {
    setCanGoBack(!!data?.nav?.canGoBack);
    setCanGoForward(!!data?.nav?.canGoForward);
  };

  const onIsAgentConnectedMsg = (data: RendererMessage['data']) => {
    setIsAgentConnected(!!data?.isAgentConnected);
  };

  const onShowFindMsg = (data: RendererMessage['data']) => {
    const incomingShouldShowFind = !!data?.shouldShowFind;
    setShouldShowFind(incomingShouldShowFind);
    if (!incomingShouldShowFind) {
      window.desktopApi.findNext('');
    }
  };

  const onLeftMouseClick = (event: MouseEvent<HTMLElement>) => {
    if (isDoubleClick(event)) {
      window.desktopApi.toggleMaximizeWindow();
    }
  };

  const onRefreshClick = (_event: SyntheticEvent) => {
    window.desktopApi.refreshPage();
  };

  const onBackClick = (_event: SyntheticEvent) => {
    window.desktopApi.goBack();
  };

  const onForwardClick = (_event: SyntheticEvent) => {
    window.desktopApi.goForward();
  };

  return (
    <div
      className='title-bar'
      onClick={ onLeftMouseClick }
    >
      <TitleBarActions
        canGoBack={ canGoBack }
        canGoForward={ canGoForward }
        onBackClick={ onBackClick }
        onForwardClick={ onForwardClick }
        onRefreshClick={ onRefreshClick }
      />
      {
        shouldShowFind &&
        <FindOnPage
          setShouldShowFind={ setShouldShowFind }
        />
      }
      {
        isAgentConnected ? (
          <StopAgentIconButton
            onStopAgentClicked={ window.desktopApi.stopAgent }
          />
        ) : (
          <StartAgentIconButton
            onStartAgentClicked={ window.desktopApi.startAgent }
          />
        )
      }
    </div>
  );
};

export type TitleBarProps = {};

export const TitleBarActions = ({
  canGoBack,
  canGoForward,
  onBackClick,
  onForwardClick,
  onRefreshClick,
}: TitleBarActionsProps): JSX.Element => {
  return (
    <div
      className='title-bar-actn-btns'
    >
      <GoBackIconButton
        disabled={ !canGoBack }
        onGoBackClicked={ onBackClick }
      />
      <GoForwardIconButton
        disabled={ !canGoForward }
        onGoForwardClicked={ onForwardClick }
      />
      <RefreshIconButton
        onRefreshClicked={ onRefreshClick }
      />
    </div>
  );
};

export type TitleBarActionsProps = {
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBackClick: (_event: SyntheticEvent) => void;
  onForwardClick: (_event: SyntheticEvent) => void,
  onRefreshClick: (_event: SyntheticEvent) => void;
};

const isDoubleClick = ({ detail }: MouseEvent<HTMLElement>) => detail === 2;
