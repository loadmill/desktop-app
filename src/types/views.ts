import { BrowserView } from 'electron';

export enum ViewName {
  AGENT = 'agent',
  PROXY = 'proxy',
  SETTINGS = 'settings',
  WEB_PAGE = 'webPage',
}

export type View = {
  id: number;
  name: ViewName;
  view: BrowserView;
};
