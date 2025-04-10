const path = require('path');

module.exports = {
  entry: {
    index: './src/main-process/index.ts',
    'loadmill-agent': './src/agent-process/loadmill-agent.ts',
  },
  externals: {
    _http_common: '_http_common',
    jsonpath: 'jsonpath',
    vm2: 'vm2',
  },
  module: {
    rules: require('./webpack.rules'),
  },
  node: {
    __dirname: true,
  },
  optimization: {
    minimize: true,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack/main'),
  },
  resolve: {
    alias: {
      formidable: false,
      type: 'type-component',
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  target: 'electron-main',
};
