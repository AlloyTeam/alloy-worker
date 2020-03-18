const path = require('path');

const projectDir = path.join(__dirname, '..');
const outputPath = path.join(projectDir, './dist');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    projectDir,
    outputPath,
    isProduction,
}
