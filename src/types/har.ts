import { PostData, Request } from './request';
import { Content, Response } from './response';

export type Har = {
  log: {
    creator: {
      name: string;
      version: string;
    };
    entries: HarEntry[];
    version: string;
  };
};

export type HarEntry = {
  request: Request & {
    id: string;
    postData?: PostData;
    queryString: QueryString[];
  },
  response: Response & {
    content: Content;
  };
  /**
   * (ISO 8601 - `YYYY-MM-DDThh:mm:ss.sTZD` e.g. `2009-07-24T19:20:30.45+01:00`).
   */
  startedDateTime: string;
};

export type QueryString = {
  name: string;
  value: string;
};
