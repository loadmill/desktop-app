import { BrowserView } from 'electron';

export enum ViewValue {
  AGENT = 'agent',
  PROXY = 'proxy',
  WEB_PAGE = 'webPage'
}

export type View = {
  id: number;
  type: ViewValue;
  view: BrowserView;
};
