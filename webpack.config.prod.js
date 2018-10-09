var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: {
    client: [
      './src/client/index.js'
    ],
    worker: [
      './src/worker/index.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      include: [path.join(__dirname, 'src')]
    }, {
      test: /\.css$/,
      use: ["style-loader", "css-loader", "sass-loader"]
    }, {
      test: /\.ne$/,
      use: ["raw-loader"]
    }]
  },
  node: {
    'fs': 'empty',
  }
};
