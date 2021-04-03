const path = require('path');
const execSync = require('child_process').execSync;

const workerSourceCodePath = path.join(__dirname, '../worker');

/**
 * 默认路径为 src/worker
 */
module.exports = (targetPath = 'src/') => {
    // 执行脚本的当前路径
    const currentPath = execSync('pwd').toString().trim();
    // eject 出来的 worker 源码目录
    const workerSourceCodeTargetPath = path.join(currentPath, targetPath);

    execSync(`mkdir -p ${targetPath}`);
    execSync(`cp -r ${workerSourceCodePath} ${targetPath}`);

    console.log(`eject alloy-worker source code to \`${workerSourceCodeTargetPath}\` success.`);
};
