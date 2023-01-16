const path = require('path');

module.exports = {
  entry: {
    index: './src/main-process/index.ts',
    'loadmill-agent': './src/agent-process/loadmill-agent.ts',
  },
  externals: {
    _http_common: '_http_common',
    vm2: 'vm2',
  },
  module: {
    rules: require('./webpack.rules'),
  },
  node: {
    __dirname: true
  },
  optimization: {
    minimize: true
  },
  output: {
    filename:'[name].js',
    path: path.resolve(__dirname, '.webpack/main'),
  },
  resolve: {
    alias: {
      type: 'type-component'
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
