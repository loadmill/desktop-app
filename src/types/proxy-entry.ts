import { Header } from './header';
import { PostData, Request } from './request';
import { Content, Response } from './response';

export type ProxyEntry = {
  id: string;
  irrelevant?: boolean;
  request: ProxyRequest;
  response: ProxyResponse;
  /**
   * Unix timestamp in milliseconds. e.g `1546300800000`.
   */
  timestamp: number;
};

export type ProxyRequest = Request & {
  body?: PostData;
};

export type ProxyResponse = Response & {
  body?: Content;
  headers: Header[];
  /**
   * HTTP status code. e.g `200`
   */
  status: number;
  statusText?: string;
};
