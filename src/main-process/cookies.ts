import { WebContents } from 'electron';

import { LOADMILL_WEB_APP_ORIGIN } from './settings/web-app-settings';

let _webContents: WebContents;

export const setWebContents = (webContents: WebContents): void => {
  _webContents = webContents;
};

export const getCookie = async (): Promise<string> => {

  let _cookie = '';
  const cookies = await _webContents.session.cookies.get({
    domain: new URL(LOADMILL_WEB_APP_ORIGIN).hostname,
    name: 'loadmill.sid',
  });

  if (cookies?.length) {
    const c = cookies[0];
    _cookie = c.name + '=' + c.value;
  }

  return _cookie;
};
