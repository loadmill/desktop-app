const log = {
  debug: console.log,
  error: console.log,
  info: console.log,
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
