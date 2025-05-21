const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const nodePathByPlatformAndArch = process.platform === 'win32' ?
  path.join('windows', 'x64') :
  path.join('macos', process.arch === 'arm64' ? 'arm64' : 'x64');
const bundledNodePath = path.join('bundled_node', nodePathByPlatformAndArch);

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: bundledNodePath,
        info: { minimized: true },
        to: path.resolve(__dirname, path.join('.webpack', 'main', bundledNodePath)),
      },
    ],
  }),
];
