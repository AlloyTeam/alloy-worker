const webpack = require('webpack');
const execSync = require('child_process').execSync;

const workerConfig = require('../worker-script/worker.webpack.config');
const config = require('./webpack.config');

const { isProduction, outputPath } = require('../worker-script/project.config');

function getBuildFinishTime() {
    function addZero(num) {
        return `0${num}`.slice(-2);
    }

    const now = new Date();
    const hours = addZero(now.getHours());
    const minutes = addZero(now.getMinutes());
    const seconds = addZero(now.getSeconds());

    return `@${hours}:${minutes}:${seconds}`;
}

const statFunc = (cb) => {
    return (err, stats) => {
        if (!err) {
            console.log(
                stats.toString({
                    all: false,
                    chunks: true,
                    errors: true,
                    errorDetails: false,
                    warnings: true,
                    timings: false,
                    colors: true,
                })
            );
            cb(err, stats);
        } else {
            console.log(err);
        }
    };
};

// 清理构建目录
execSync(`rm -rf ${outputPath}`);

if (isProduction) {
    const compiler = webpack([workerConfig, config]);
    compiler.run(
        statFunc((err, stats) => {
            console.log('dist: 页面构建完成', getBuildFinishTime());
        })
    );
} else {
    const compiler = webpack([workerConfig, config]);
    compiler.watch(
        {
            ignored: ['node_modules', 'script'],
            aggregateTimeout: 300,
        },
        statFunc((err, stats) => {
            console.log('dev: 页面构建完成', getBuildFinishTime());
        })
    );
}
