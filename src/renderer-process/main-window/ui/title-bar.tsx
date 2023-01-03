import React, {
  MouseEvent,
  SyntheticEvent,
  useEffect,
  useState
} from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { RendererMessage } from '../../../types/messaging';
import { MESSAGE, NAVIGATION } from '../../../universal/constants';

import { GoBackIconButton, GoForwardIconButton, RefreshIconButton } from './actions-icon-buttons';

const isDoubleClick = ({ detail }: MouseEvent<HTMLElement>) => detail === 2;

export const TitleBar: React.FC<TitleBarProps> = (): JSX.Element => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);

  const onNavigationMsg = (data: RendererMessage['data']) => {
    setCanGoBack(!!data?.nav?.canGoBack);
    setCanGoForward(!!data?.nav?.canGoForward);
  };

  const onPreloadMessage = (event: MessageEvent<RendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { type, data } } = event;
      switch (type) {
        case NAVIGATION:
          onNavigationMsg(data);
          break;
        default:
          break;
      }
    }
  };

  const onMessage = (event: MessageEvent<RendererMessage>) => {
    onPreloadMessage(event);
  };

  useEffect(() => {
    window.addEventListener(MESSAGE, onMessage);
    return () => {
      window.removeEventListener(MESSAGE, onMessage);
    };
  }, []);

  const onLeftMouseClick = (event: MouseEvent<HTMLElement>) => {
    if (isDoubleClick(event)) {
      window.loadmillDesktop.toggleMaximizeWindow();
    }
  };

  const onRefreshClick = (_event: SyntheticEvent) => {
    window.loadmillDesktop.refreshPage();
  };

  const onBackClick = (_event: SyntheticEvent) => {
    window.loadmillDesktop.goBack();
  };

  const onForwardClick = (_event: SyntheticEvent) => {
    window.loadmillDesktop.goForward();
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
    </div>
  );
};

export type TitleBarProps = {};

export const TitleBarActions: React.FC<TitleBarActionsProps> = ({
  canGoBack,
  canGoForward,
  onBackClick,
  onForwardClick,
  onRefreshClick,
}): JSX.Element => {
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
