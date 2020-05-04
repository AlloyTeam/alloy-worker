/*
 * 主线程源码构建时需要为 Worker 构建而添加的 plugin 列表
 * 独立抽离出来, 方便融合到其他项目时, 其他项目的构建最少入侵地添加所需 plugin
 * 
 * @Author: CntChen
 * @Date: 2020-05-02
 */


const path = require('path');
const webpack = require('webpack');

const { outputPath, workerFileName, manifestFileForWorker } = require('./project.config');
const ReplaceWorkerFileNamePlaceholderPlugin = require('./replace-worker-file-name-placeholder-plugin');

module.exports = [
    new webpack.DefinePlugin({
        // __WORKER__ 表示当前所在线程是否是 Worker 线程
        // 主线程构建中为 false
        __WORKER__: false,
    }),
    new ReplaceWorkerFileNamePlaceholderPlugin({
        test: [/\.js$/],
        workerFileName: `${workerFileName}.js`,
        workerFileNamePlaceholder: 'WORKER_FILE_NAME_PLACEHOLDER',
        manifestFileForWorkerPath: path.join(outputPath, manifestFileForWorker),
    }),
];
