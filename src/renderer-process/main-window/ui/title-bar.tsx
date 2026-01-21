import React, {
  MouseEvent,
  useEffect,
  useState,
} from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import type { AgentStatus } from '../../../types/agent-status';
import { MainWindowRendererMessage } from '../../../types/messaging';
import { ViewName } from '../../../types/views';
import {
  AGENT_STATUS_CONNECTING,
  AGENT_STATUS_DISCONNECTED,
  AGENT_STATUS_DISCONNECTING,
  AGENT_STATUS_OUTDATED,
  AGENT_STATUS_RESTARTING,
  IS_AGENT_CONNECTED,
  IS_AGENT_OUTDATED,
  MESSAGE,
  NAVIGATION,
  SHOW_FIND_ON_PAGE,
  SWITCH_VIEW,
} from '../../../universal/constants';

import {
  CopyIconButton,
  GoBackIconButton,
  GoForwardIconButton,
  RefreshIconButton,
} from './actions-icon-buttons';
import { AgentButton } from './agent-button';
import { FindOnPage } from './find-on-page';
import { ViewsSwitch, ViewsSwitchProps } from './views-switch';

export const TitleBar: React.FC<TitleBarProps> = (): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [shouldShowFind, setShouldShowFind] = useState<boolean>(false);
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);
  const [isAgentOutdated, setIsAgentOutdated] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AGENT_STATUS_DISCONNECTED);
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
    if (data?.agentStatus) {
      setAgentStatus(data.agentStatus);
    }
  };

  const onIsAgentOutdatedMsg = (data: MainWindowRendererMessage['data']) => {
    if (data?.isAgentOutdated) {
      setIsAgentOutdated(true);
      setAgentStatus(AGENT_STATUS_OUTDATED);
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

  const getAgentLoaderTooltipTitle = () => {
    if (agentStatus === AGENT_STATUS_DISCONNECTING) {
      return 'Disconnecting agent';
    }
    if (agentStatus === AGENT_STATUS_RESTARTING) {
      return 'Restarting agent';
    }
    return 'Connecting agent';
  };

  const shouldShowAgentLoader = [
    AGENT_STATUS_CONNECTING,
    AGENT_STATUS_DISCONNECTING,
    AGENT_STATUS_RESTARTING,
  ].includes(agentStatus);

  const isStartAgentDisabled = isAgentOutdated || agentStatus === AGENT_STATUS_OUTDATED;

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
      <AgentButton
        isAgentConnected={ isAgentConnected }
        isStartAgentDisabled={ isStartAgentDisabled }
        shouldShowAgentLoader={ shouldShowAgentLoader }
        tooltipTitle={ getAgentLoaderTooltipTitle() }
      />
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
        tooltipTitle='Copy URL'
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
