import { WebContents } from 'electron';

import { LOADMILL_WEB_APP_ORIGIN } from './constants';

let _webContents: WebContents;

export const setWebContents = (webContents: WebContents): void => {
  _webContents = webContents;
};

const defaultFilters: Electron.CookiesGetFilter = {
  domain: new URL(LOADMILL_WEB_APP_ORIGIN).hostname,
  name: 'loadmill.sid',
};

export const getCookie = async (
  webContents: WebContents = _webContents,
  filters: Electron.CookiesGetFilter = defaultFilters,
): Promise<string> => {
  let _cookie = '';

  const cookies = await webContents.session.cookies.get(filters);

  if (cookies?.length) {
    const c = cookies[0];
    _cookie = c.name + '=' + c.value;
  }

  return _cookie;
};
