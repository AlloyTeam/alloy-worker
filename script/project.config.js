const path = require('path');

const projectDir = path.join(__dirname, '..');
const outputPath = path.join(projectDir, './dist');
const isProduction = process.env.NODE_ENV === 'production';
/**
 * 构建输出的 worker 资源名称
 */
const workerFileName = 'alloy-worker';

module.exports = {
    projectDir,
    outputPath,
    isProduction,
    workerFileName,
}
