const { execFileSync } = require('child_process');
const { log: logInfo } = require('console');

const electronPath = require('electron');

export const getElectronNodeVersion = (): string => {
  const nodeVersion = execFileSync(electronPath, ['-p', 'process.versions.node'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
  }).trim();

  logInfo('Bundled Node.js version in Electron:', nodeVersion);

  return nodeVersion;
};
