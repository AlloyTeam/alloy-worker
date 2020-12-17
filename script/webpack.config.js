const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const { isProduction, outputPath, projectDir } = require('../worker-script/project.config');
const PluginForMainThreadBuild = require('../worker-script/plugin-for-main-thread-build');

const sourceMap = isProduction ? 'source-map' : 'cheap-module-source-map';
const pagePath = path.join(projectDir, './src/page');

const config = {
    entry: {
        index: path.join(pagePath, '/index.ts'),
        image: path.join(pagePath, '/image.ts'),
    },
    output: {
        filename: isProduction ? '[name]-[hash:8].js' : '[name].js',
        path: outputPath,
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            worker: path.resolve(projectDir, 'src/worker'),
        },
    },
    externals: {
        'worker/worker-thread': 'worker.WorkerThreadWorker',
        'worker/worker-thread/index': 'worker.WorkerThreadWorker',
    },
    mode: isProduction ? 'production' : 'development',
    devtool: sourceMap,
    optimization: {
        minimize: isProduction,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ],
            },
        ],
    },
    plugins: [
        ...PluginForMainThreadBuild,
        new HtmlWebpackPlugin({
            template: path.join(pagePath, '/index.html'),
            filename: 'index.html',
            chunks: [ 'index' ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(pagePath, '/image.html'),
            filename: 'image.html',
            chunks: [ 'image' ],
        }),
        new CopyPlugin([
            {
                from: path.join(pagePath, 'img'),
                to: path.join(outputPath, 'img'),
            },
        ]),
    ],
};

module.exports = config;
