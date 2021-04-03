const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { isProduction, outputPath, projectDir } = require('./project.config');
// alloy-worker 自定义插件, 实现 worker 资源独立构建和动态化等能力
const AlloyWorkerPlugin = require('../src/plugin/index');

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
        new HtmlWebpackPlugin({
            template: path.join(pagePath, '/index.html'),
        }),
        new AlloyWorkerPlugin({}),
    ],
};

module.exports = config;
