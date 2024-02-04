export type Extraction = { [parameter: string]: string | object };
export type LoadmillRequest = {
  description?: string;
  extract: Extraction[];
  id: string;
  irrelevant?: boolean;
  method: string;
  url: string;
};
export type TransformResult = { conf: { requests: LoadmillRequest[] } };
export type TransformOptions = {
  options: {
    filterIrrelevantRequests?: boolean;
    keepAllMimeTypes?: boolean;
  };
};
