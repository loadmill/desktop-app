import { Body } from './body';
import { Header } from './header';

export type Request = {
  headers: Header[];
  method: string;
  url: string;
};

export type PostData = Body & {
  params?: PostDataParam[];
};

export type PostDataParam = {
  contentType?: string;
  fileName?: string;
  name: string;
  value?: string;
};
