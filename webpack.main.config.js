const path = require('path');

module.exports = {
  entry: {
    index: './src/index.ts',
    'loadmill-agent': './src/loadmill-agent.ts',
  },
  externals: {
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
