const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

const { isProduction, outputPath, projectDir, workerFileName, manifestFileForWorker } = require('./project.config');

const sourceMap = isProduction ? 'source-map' : 'cheap-module-source-map';
const workerEntry = path.join(projectDir, './src/worker/worker-thread/index');

const config = {
    entry: {
        [workerFileName]: workerEntry,
    },
    output: {
        filename: isProduction ? '[name]-[hash:8].js' : '[name].js',
        path: outputPath,
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    mode: isProduction ? 'production': 'development',
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
        new webpack.DefinePlugin({
            __WORKER__: true,
        }),
        // 添加 window 全局对象, 映射为 Worker 线程全局对象 self
        // 如果在 worker 源码中添加, 没有前置到所有引用模块前
        new webpack.BannerPlugin({
            banner: 'self.window = self;',
            raw: true,
            entryOnly: true,
        }),
        new ManifestPlugin({
            fileName: manifestFileForWorker,
        }),
    ],
};

module.exports = config;
