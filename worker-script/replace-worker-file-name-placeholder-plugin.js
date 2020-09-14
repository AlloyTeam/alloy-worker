/*
 * 构建后资源的 worker 文件名占位符, 替换为带 hash 的 worker 资源文件名
 * 如: 'WORKER_FILE_NAME_PLACEHOLDER' -> 'alloy-worker-51497b48.js'
 * @Author: CntChen
 * @Date: 2020-03-18
 */

'use strict';

const fs = require('fs');

/**
 * 遍历目录获取文件数组
 */
function getAllFiles(root) {
    let res = [];
    const files = fs.readdirSync(root);
    files.forEach(function (file) {
        const pathname = root + '/' + file;
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory()) {
            res.push(pathname);
        } else {
            res = res.concat(getAllFiles(pathname));
        }
    });
    return res;
}

class ReplaceWorkerFileNamePlaceholderPlugin {
    constructor(options) {
        this.name = 'ReplaceWorkerFileNamePlaceholderPlugin';

        this.options = {};
        this.options.dir = options.dir;
        this.options.test = options.test ? (options.test instanceof Array ? options.test : [options.test]) : null;

        if (!options.workerFileName) {
            console.error(this.name, '缺少 workerFileName 参数');
        }
        if (!options.manifestFileForWorkerPath) {
            console.error(this.name, '缺少 manifestFileForWorkerPath 参数');
        }
        if (!options.workerFileNamePlaceholder) {
            console.error(this.name, '缺少 workerFileNamePlaceholder 参数');
        }

        this.options.workerFileName = options.workerFileName;
        this.options.manifestFileForWorkerPath = options.manifestFileForWorkerPath;
        this.options.workerFileNamePlaceholder = options.workerFileNamePlaceholder;

        this.apply = this.apply.bind(this);
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync(this.name, (compilation, callback) => {
            const dir = this.options.dir || compilation.outputOptions.path;

            // 等待 2000ms, 避免资源未落硬盘, 导致无法读取 manifest 文件
            setTimeout(() => {
                // 获取带 hash 的 worker 资源文件名
                const manifestWorker = JSON.parse(fs.readFileSync(this.options.manifestFileForWorkerPath).toString());
                const workerFileNameWithHash = manifestWorker[this.options.workerFileName];

                if (!workerFileNameWithHash) {
                    console.error(`${this.options.workerFileName} not exist.`);
                    return;
                }

                let targetFiles = getAllFiles(dir);

                // 根据过滤规则进行文件过滤
                if (this.options.test) {
                    targetFiles = targetFiles.filter((file) => {
                        return this.options.test.some((test) => test.test(file));
                    });
                }
                // console.log('匹配到的文件: ', targetFiles);

                targetFiles.forEach((file) => {
                    const fileStr = fs.readFileSync(file).toString();
                    const newFileStr = fileStr.replace(
                        new RegExp(this.options.workerFileNamePlaceholder, 'g'),
                        workerFileNameWithHash
                    );
                    if (fileStr != newFileStr) {
                        // console.log('进行替换的文件: ', file);
                    }
                    fs.writeFileSync(file, newFileStr, 'utf-8');
                });

                callback();
            }, 2000);
        });
    }
}

module.exports = ReplaceWorkerFileNamePlaceholderPlugin;
