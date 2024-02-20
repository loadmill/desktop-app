const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new DefinePlugin({
    'process.env': {
      LOADMILL_CLIENT_SECRET: JSON.stringify(process.env.LOADMILL_CLIENT_SECRET),
    },
  }),
];
