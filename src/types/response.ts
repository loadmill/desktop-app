import { Body } from './body';
import { Header } from './header';

export type Response = {
  headers: Header[];
  status: number;
};

export type Content = Body;
