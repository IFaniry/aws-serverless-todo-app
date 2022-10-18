const path = require('path')
const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  externals: [
    nodeExternals(),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.json', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  // target: 'node', // https://www.npmjs.com/package/webpack-node-externals
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /\.(ts?)$/,
        loader: 'ts-loader',
      },
    ],
  },
  // https://blog.logrocket.com/transpile-es-modules-with-webpack-node-js/
  // experiments: {
  //     outputModule: true,
  // },
}
