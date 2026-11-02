const path = require('path');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  // Only affects dev (`electron-forge start`): production bundles don't include the HMR client.
  new webpack.NormalModuleReplacementPlugin(
    /webpack[\\/]hot[\\/]emitter\.js$/,
    path.resolve(__dirname, 'webpack.hot-emitter.js'),
  ),
];
