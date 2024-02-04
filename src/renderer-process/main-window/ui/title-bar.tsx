import React, {
  MouseEvent,
  useEffect,
  useState,
} from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { RendererMessage } from '../../../types/messaging';
import { ViewName } from '../../../types/views';
import {
  IS_AGENT_CONNECTED,
  MESSAGE,
  NAVIGATION,
  SHOW_FIND_ON_PAGE,
  SWITCH_VIEW,
} from '../../../universal/constants';

import { GoBackIconButton, GoForwardIconButton, RefreshIconButton, StartAgentIconButton, StopAgentIconButton } from './actions-icon-buttons';
import { FindOnPage } from './find-on-page';
import { ViewsSwitch, ViewsSwitchProps } from './views-switch';

export const TitleBar: React.FC<TitleBarProps> = (): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [shouldShowFind, setShouldShowFind] = useState<boolean>(false);
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);
  const [view, setView] = useState<ViewName>(ViewName.WEB_PAGE);

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
        case SWITCH_VIEW:
          onSwitchViewMsg(data);
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

  const onSwitchViewMsg = (data: RendererMessage['data']) => {
    setView(data?.view);
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

  const onRefreshClick = () => {
    window.desktopApi.refreshPage();
  };

  const onBackClick = () => {
    window.desktopApi.goBack();
  };

  const onForwardClick = () => {
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
        setView={ setView }
        view={ view }
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
  setView,
  view,
}: TitleBarActionsProps): JSX.Element => {
  const isNavigationDisabled = view !== ViewName.WEB_PAGE;
  return (
    <div
      className='title-bar-actn-btns'
    >
      <GoBackIconButton
        disabled={ isNavigationDisabled || !canGoBack }
        onGoBackClicked={ onBackClick }
      />
      <GoForwardIconButton
        disabled={ isNavigationDisabled || !canGoForward }
        onGoForwardClicked={ onForwardClick }
      />
      <RefreshIconButton
        disabled={ isNavigationDisabled }
        onRefreshClicked={ onRefreshClick }
      />
      <div style={ { marginLeft: '1rem' } }>
        <ViewsSwitch
          setView={ setView }
          view={ view }
        />
      </div>
    </div>
  );
};

export type TitleBarActionsProps = {
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBackClick: () => void;
  onForwardClick: () => void,
  onRefreshClick: () => void;
} & ViewsSwitchProps;

const isDoubleClick = ({ detail }: MouseEvent<HTMLElement>) => detail === 2;
