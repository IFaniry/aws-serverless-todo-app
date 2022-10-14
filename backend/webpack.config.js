const path = require('path')
const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')

// TODO: https://medium.com/@sheepsteak/excluding-the-aws-sdk-from-a-serverless-package-8dcad2f31954
// TODO: https://github.com/typedorm/typedorm-examples/tree/main/examples/aws-sdk-v3-typescript-webpack

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  externals: [
    nodeExternals(),
    // nodeExternals({
    //   modulesDir: path.resolve(dirName, '../../node_modules'),
    // }),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.json', '.ts'],
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
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        test: /\.(ts?)$/,
        loader: 'ts-loader',
        // exclude: [
        //   [
        //     path.resolve(__dirname, 'node_modules'),
        //     path.resolve(__dirname, '.serverless'),
        //     path.resolve(__dirname, '.webpack'),
        //   ],
        // ],
      },
    ],
  },
  // externals: ['aws-sdk', 'aws-crt'],
}
