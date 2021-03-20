const path = require('path');

/**
 * 项目根目录
 */
const projectDir = path.join(__dirname, '..');
/**
 * 构建打包的 output 目录
 */
const outputPath = path.join(projectDir, './dist');
/**
 * 是否 prod 构建模式
 */
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    projectDir,
    outputPath,
    isProduction,
};
