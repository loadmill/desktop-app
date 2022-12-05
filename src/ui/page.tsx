import React, { Ref } from 'react';

import { ConnectPage } from './connect-page';
import { Console } from './console';

export type PageType = 'connect' | 'console';

export const Page: React.FC<PageProps> = ({
  isConnected,
  log,
  page,
  scrollRef,
  scrollToBottom,
  setPage,
  setToken,
  token,
}): JSX.Element => (
  <div
    className='page-wrapper'
  >
    { (page === 'connect') ? (
      <ConnectPage
        isConnected={ isConnected }
        setPage={ setPage }
        setToken={ setToken }
        token={ token }
      />
    ) : (
      <Console
        log={ log }
        scrollRef={ scrollRef }
        scrollToBottom={ scrollToBottom }
      />
    ) }
  </div>
);

export type PageProps = {
  isConnected: boolean;
  log: string[];
  page: PageType;
  scrollRef: Ref<HTMLLIElement>;
  scrollToBottom: () => void;
  setPage: React.Dispatch<React.SetStateAction<PageType>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  token: string;
};
