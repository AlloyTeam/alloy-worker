const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

const {
    isProduction,
    outputPath,
    projectDir,
} = require('./project.config');

const sourceMap = isProduction ? 'source-map' : 'cheap-module-source-map';
const workerEntry = path.join(projectDir, './src/worker/worker-thread/index');

const config = {
    entry: {
        worker: workerEntry,
    },
    output: {
        filename: isProduction ? '[name]-[hash:8].js' : '[name].js',
        path: outputPath,
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devtool: sourceMap,
    optimization: {
        minimize: isProduction,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __WORKER__: true,
        }),
        new ManifestPlugin({
            fileName: 'manifest-worker.json'
        }),
    ]
}

module.exports = config;
