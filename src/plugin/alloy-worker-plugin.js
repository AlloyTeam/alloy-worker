/*
 * alloy-worker-plugin
 */

const path = require('path');
const webpack = require('webpack');
const { WorkerPluginName } = require('./constants');

class AlloyWorkerPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        // 为主线程构建添加 __WORKER__ 环境变量, 构建中区分不同线程源码, 实现代码拆减
        compiler.hooks.afterPlugins.tap(WorkerPluginName, (compiler) => {
            new webpack.DefinePlugin({
                // __WORKER__ 表示当前所在线程是否是 2orker 线程
                // 主线程构建中为 false
                __WORKER__: false,
            }).apply(compiler);
        });

        // 添加自定义的 alloy-worker entry-loader
        compiler.hooks.afterResolvers.tap(WorkerPluginName, (compiler) => {
            /**
             * https://webpack.js.org/configuration/resolve/#resolveloader
             * 使用 resolveloader 添加自定义的 worker loader
             */
            if (!compiler.options.resolveLoader) {
                compiler.options.resolveLoader = {
                    alias: {},
                };
            }
            if (!compiler.options.resolveLoader.alias) {
                compiler.options.resolveLoader.alias = {};
            }

            // 动态添加 worker 的 worker-loader, 命名为 "alloy-worker"
            compiler.options.resolveLoader.alias['alloy-worker'] = path.resolve(__dirname, './worker-loader.js');
        });
    }
}

module.exports = AlloyWorkerPlugin;
