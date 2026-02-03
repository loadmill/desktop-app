const noop = (): void => {};

const log = {
  debug: noop,
  error: noop,
  info: noop,
  warn: noop,
  transports: {
    console: {
      level: 'debug',
    },
    file: {
      level: 'debug',
    },
  },
};

export default log;
