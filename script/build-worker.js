const webpack = require('webpack');
const execSync = require('child_process').execSync;

const workerConfig = require('./worker.webpack.config');

const {
    isProduction,
    outputPath,
} = require('./project.config');

const statFunc = (cb) => {
    return (err, stats) => {
        if (!err) {
            console.log(
                stats.toString({
                    all: false,
                    chunks: true,
                    errors: true,
                    errorDetails: false,
                    warnings: false,
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
    const workerCompiler = webpack(workerConfig);
    workerCompiler.run(
        statFunc((err, stats) => {
            console.log('dist: worker 构建完成');
        })
    );
} else {
    const workerCompiler = webpack(workerConfig);
    workerCompiler.watch({
        ignored: ['node_modules', 'script'],
        aggregateTimeout: 300,
    },
        statFunc((err, stats) => {
            console.log('dev: worker 构建完成');
        })
    );
}
