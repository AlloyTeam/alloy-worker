/*
 * alloy-worker worker-loader
 *
 * @Author: CntChen
 * @Date: 2021-03-19
 */

const webpack = require('webpack');
const loaderUtils = require('loader-utils');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const { WorkerLoaderName, FileNamePrefix } = require('./constants');

// 正常 loader 处理逻辑
function loader() {
    const callback = this.async();
    this.cacheable(false);

    // 过滤掉当前的 worker-loader, 保留 worker 侧构建需要的其他 loader(babel-loader/ts-loader 等)
    const otherLoaders = this.loaders.filter((loader, index) => {
        if (index === this.loaderIndex) {
            return false;
        }
        return true;
    });
    /**
     * 拼接构建需要的 loader 字符串, 用于指定 childCompiler 的构建 loader
     * 比如: /path/to/babel-loader/lib/index.js!/path/to/ts-loader/index.js!
     */
    const loaderPath = otherLoaders.reduce((pre, loader) => {
        return `${pre}${loader.path}!`;
    }, '');

    /**
     * worker 独立构建的 entry
     * 构建 loader + worker 源码入口文件路径
     *
     * https://webpack.js.org/concepts/loaders/#inline
     * `!!` 实现在 childCompiler 中忽略其他所有 loader, 只保留主构建的 loader
     * 不然 worker 入口在 childCompiler 中会继续由 worker-loader 处理, 造成死循环
     */
    let workerEntry = `!!${loaderPath}${this.resourcePath}`;

    // 把资源纳入构建流程的依赖, 实现 dev 模式下的 watch
    this.addDependency(workerEntry);

    // 生成的 service 独立 bundle 名称
    const entryFileName = `${FileNamePrefix}index`;

    // TODO 怎么传递
    // 获取传递给 loader 的 options
    const options = loaderUtils.getOptions(this) || {};

    // 创建 childCompiler, 用于实现 worker 构建为独立 js 资源
    const childCompiler = this._compilation.createChildCompiler(WorkerLoaderName, {
        globalObject: 'this',
    });
    childCompiler.context = this._compiler.context;

    // 指定独立构建的 entry 和生成 js 资源名称
    new SingleEntryPlugin(this.context, workerEntry, entryFileName).apply(childCompiler);

    // 设置 worker 侧的环境变量
    new webpack.DefinePlugin({
        __WORKER__: true,
    }).apply(childCompiler);

    // 添加 window 全局对象, 映射为 worker 线程全局对象 self
    // 如果在 worker 源码中添加, 可能没有前置到所有引用模块前
    new webpack.BannerPlugin({
        banner: 'self.window = self;',
        raw: true,
        entryOnly: true,
    }).apply(childCompiler);

    const subCache = `subcache ${__dirname} ${workerEntry}`;
    childCompiler.hooks.compilation.tap(WorkerLoaderName, (compilation) => {
        if (compilation.cache) {
            if (!compilation.cache[subCache]) compilation.cache[subCache] = {};
            compilation.cache = compilation.cache[subCache];
        }
    });

    childCompiler.runAsChild((error, entries, compilation) => {
        if (!error && compilation.errors && compilation.errors.length) {
            error = compilation.errors[0];
        }

        // compatible with Array (v4) and Set (v5) prototypes
        const entry = entries && entries[0] && entries[0].files.values().next().value;
        if (!error && !entry) {
            error = Error(`${WorkerLoaderName}, no entry for ${workerEntry}`);
        }
        if (error) {
            return callback(error);
        }

        return callback(
            null,
            // 插入代码的转译和压缩由主构建配置的 babel/ts loader 处理, 不需要 worker-worker 来处理
            // 添加 @ts-nocheck 避免 ts-check 报错
            `// @ts-nocheck
            const servicePath = __webpack_public_path__ + ${JSON.stringify(entry)};
            export default servicePath;
            `
        );
    });

    return;
}

module.exports = loader;
