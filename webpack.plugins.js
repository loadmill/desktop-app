const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'bundled_node',
        info: { minimized: true },
        to: path.resolve(__dirname, '.webpack/main/bundled_node'),
      },
    ],
  }),
];
