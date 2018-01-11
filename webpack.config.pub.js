var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/index',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'Utils.js',
        publicPath: '/',
        libraryTarget: "umd",
        library: "Utils"
    },
    resolve: {
        extensions: ['', '.js']
    },

    devtool: 'source-map',
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};