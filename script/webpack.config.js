const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReplaceWorkerFileNamePlaceholderPlugin = require('./replace-worker-file-name-placeholder-plugin');

const { isProduction, outputPath, projectDir, workerFileName, manifestFileForWorker } = require('./project.config');

const sourceMap = isProduction ? 'source-map' : 'cheap-module-source-map';
const pagePath = path.join(projectDir, './src/page');

const config = {
    entry: {
        index: path.join(pagePath, '/index.ts'),
    },
    output: {
        filename: isProduction ? '[name]-[hash:8].js' : '[name].js',
        path: outputPath,
    },
    resolve: {
        extensions: ['.ts'],
        alias: {
            worker: path.resolve(projectDir, 'src/worker'),
        },
    },
    externals: {
        'worker/worker-thread': 'worker.WorkerThreadWorker',
        'worker/worker-thread/index': 'worker.WorkerThreadWorker',
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
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __WORKER__: false,
        }),
        new HtmlWebpackPlugin({
            template: path.join(pagePath, '/index.html'),
        }),
        new ReplaceWorkerFileNamePlaceholderPlugin({
            test: [/\.html$/],
            workerFileName: `${workerFileName}.js`,
            workerFileNamePlaceholder: 'WORKER_FILE_NAME_PLACEHOLDER',
            manifestFileForWorkerPath: path.join(outputPath, manifestFileForWorker),
        }),
    ],
};

module.exports = config;
