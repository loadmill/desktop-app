import log from 'electron-log';

const setLogLevels = () => {
  log.transports.file.level = 'info';
  log.transports.console.level = 'silly';
  // Now log.debug Will show in console mode (dev) but not in file mode (prod)
};

setLogLevels();

export default log;
