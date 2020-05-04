const path = require('path');

const config = {
    mainThreadTemplatePath: path.join(__dirname, './template/main-thread.pug'),
    workerThreadTemplatePath: path.join(__dirname, './template/worker-thread.pug'),
    mainThreadTargetDir: path.join(__dirname, '../main-thread'),
    workerThreadTargetDir: path.join(__dirname, '../worker-thread'),
    actionTypeFilePath: path.join(__dirname, '../common/action-type.ts'),
    payloadTypeFilePath: path.join(__dirname, '../common/payload-type.ts'),
};

module.exports = config;
