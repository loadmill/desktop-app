export type StartupProgress =
  'startScreenStarted' |
  'headTag' |
  'componentDidMount' |
  'readyStateComplete' | 'fullLoad' | // mutually exclusive & represent the same state
  'appReady';
