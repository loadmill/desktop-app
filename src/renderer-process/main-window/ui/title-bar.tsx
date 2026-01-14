import React, {
  MouseEvent,
  useEffect,
  useState,
} from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import type { AgentUiStatus } from '../../../types/agent-ui';
import { MainWindowRendererMessage } from '../../../types/messaging';
import { ViewName } from '../../../types/views';
import {
  AGENT_UI_STATUS_DISCONNECTING,
  AGENT_UI_STATUS_OUTDATED,
  AGENT_UI_STATUS_RESTARTING,
  AGENT_UI_STATUS_CONNECTING,
  AGENT_UI_STATUS_DISCONNECTED,
  IS_AGENT_CONNECTED,
  IS_AGENT_OUTDATED,
  MESSAGE,
  NAVIGATION,
  SHOW_FIND_ON_PAGE,
  SWITCH_VIEW,
} from '../../../universal/constants';

import {
  AgentLoadingIconButton,
  CopyIconButton,
  GoBackIconButton,
  GoForwardIconButton,
  RefreshIconButton,
  StartAgentIconButton,
  StopAgentIconButton,
} from './actions-icon-buttons';
import { FindOnPage } from './find-on-page';
import { ViewsSwitch, ViewsSwitchProps } from './views-switch';

export const TitleBar: React.FC<TitleBarProps> = (): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [shouldShowFind, setShouldShowFind] = useState<boolean>(false);
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);
  const [isAgentOutdated, setIsAgentOutdated] = useState<boolean>(false);
  const [agentUiStatus, setAgentUiStatus] = useState<AgentUiStatus>(AGENT_UI_STATUS_DISCONNECTED);
  const [view, setView] = useState<ViewName>(ViewName.WEB_PAGE);

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);
    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  const onPreloadMessage = (event: MessageEvent<MainWindowRendererMessage>) => {
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
        case IS_AGENT_OUTDATED:
          onIsAgentOutdatedMsg(data);
          break;
        case SWITCH_VIEW:
          onSwitchViewMsg(data);
          break;
        default:
          break;
      }
    }
  };

  const onNavigationMsg = (data: MainWindowRendererMessage['data']) => {
    setCanGoBack(!!data?.nav?.canGoBack);
    setCanGoForward(!!data?.nav?.canGoForward);
  };

  const onIsAgentConnectedMsg = (data: MainWindowRendererMessage['data']) => {
    setIsAgentConnected(!!data?.isAgentConnected);
    if (data?.agentUiStatus) {
      setAgentUiStatus(data.agentUiStatus);
    }
  };

  const onIsAgentOutdatedMsg = (data: MainWindowRendererMessage['data']) => {
    if (data?.isAgentOutdated) {
      setIsAgentOutdated(true);
      setAgentUiStatus(AGENT_UI_STATUS_OUTDATED);
    }
  };

  const onSwitchViewMsg = (data: MainWindowRendererMessage['data']) => {
    setView(data?.view);
  };

  const onShowFindMsg = (data: MainWindowRendererMessage['data']) => {
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

  const onCopyUrlClick = () => {
    window.desktopApi.copyUrl();
  };

  const shouldShowAgentLoader = agentUiStatus === AGENT_UI_STATUS_CONNECTING
    || agentUiStatus === AGENT_UI_STATUS_DISCONNECTING
    || agentUiStatus === AGENT_UI_STATUS_RESTARTING;

  const agentLoaderTitle = agentUiStatus === AGENT_UI_STATUS_DISCONNECTING
    ? 'Disconnecting agent'
    : agentUiStatus === AGENT_UI_STATUS_RESTARTING
      ? 'Restarting agent'
      : 'Connecting agent';

  return (
    <div
      className='title-bar'
      onClick={ onLeftMouseClick }
    >
      <TitleBarActions
        canGoBack={ canGoBack }
        canGoForward={ canGoForward }
        onBackClick={ onBackClick }
        onCopyUrlClick={ onCopyUrlClick }
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
        shouldShowAgentLoader ? (
          <AgentLoadingIconButton
            title={ agentLoaderTitle }
          />
        ) : isAgentConnected ? (
          <StopAgentIconButton
            onStopAgentClicked={ window.desktopApi.stopAgent }
          />
        ) : (
          <StartAgentIconButton
            disabled={ isAgentOutdated || agentUiStatus === AGENT_UI_STATUS_OUTDATED }
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
  onCopyUrlClick,
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
      <CopyIconButton
        disabled={ isNavigationDisabled }
        onCopyClicked={ onCopyUrlClick }
        title='Copy URL'
      />
      <ViewsSwitch
        setView={ setView }
        view={ view }
      />
    </div>
  );
};

export type TitleBarActionsProps = {
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBackClick: () => void;
  onCopyUrlClick: () => void;
  onForwardClick: () => void,
  onRefreshClick: () => void;
} & ViewsSwitchProps;

const isDoubleClick = ({ detail }: MouseEvent<HTMLElement>) => detail === 2;
