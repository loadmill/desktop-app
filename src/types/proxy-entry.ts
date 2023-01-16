export type ProxyEntry = {
  id: string;
  request: Request;
  response: Response;
  timestamp: number;
};

export type Request = {
  body?: Body;
  headers: Header[];
  method: Method;
  url: string;
};

export type Body = {
  mimeType?: string;
  text?: string;
};

export type Header = {
  name: string;
  value: string;
};

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type Response = {
  body?: Body;
  headers: Header[];
  status: number;
  statusText?: string;
};
