const path = require('path');
const execSync = require('child_process').execSync;

/**
 * alloy-worker 项目根目录
 */
const projectDir = path.join(__dirname, '../../../');
/**
 * 执行脚本的当前路径
 */
const currentPath = execSync('pwd').toString().trim();

const config = {
    mainThreadTemplatePath: path.join(__dirname, './template/main-thread.pug'),
    workerThreadTemplatePath: path.join(__dirname, './template/worker-thread.pug'),
    mainThreadTargetDir: path.join(currentPath, './src/worker/main-thread'),
    workerThreadTargetDir: path.join(currentPath, './src/worker/worker-thread'),
    actionTypeFilePath: path.join(currentPath, 'src/worker/common/action-type.ts'),
    payloadTypeFilePath: path.join(currentPath, './src/worker/common/payload-type.ts'),
};

module.exports = config;
