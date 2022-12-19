const Dotenv = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = [new Dotenv(), new ForkTsCheckerWebpackPlugin()];
