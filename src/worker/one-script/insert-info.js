const fs = require('fs');
const config = require('./config');

const insertInfo = (pureActionName) => {
    // 添加新事务的 aciton type
    const actionTypeFileStr = fs.readFileSync(config.actionTypeFilePath, 'utf-8').toString();
    const appendActionTypeStr = `\nexport const enum ${pureActionName}ActionType {
    __MainCallWorker__ = '__MainCallWorker__',
    __WorkerCallMain__ = '__WorkerCallMain__',
}\n`;
    fs.writeFileSync(config.actionTypeFilePath, `${actionTypeFileStr}${appendActionTypeStr}`, 'utf-8');
    console.log('done: 添加新事务的 aciton type.');

    // 添加新事务的 payload type
    let payloadTypeFileStr = fs.readFileSync(config.payloadTypeFilePath, 'utf-8').toString();

    // 请求类型
    const appendPayloadTypeStr = `
    namespace ${pureActionName} {
        type __MainCallWorker__ = string;
        type __WorkerCallMain__ = {
            hello: number;
            world: number;
        };
    }\n`;
    payloadTypeFileStr = payloadTypeFileStr.replace(/(WorkerPayload\s{)/, `$1${appendPayloadTypeStr}`);

    // 响应类型
    const appendResponseTypeStr = `
    namespace ${pureActionName} {
        type __MainCallWorker__ = number;
        type __WorkerCallMain__ = {
            alloy: string;
            worker: string;
        };
    }\n`;
    payloadTypeFileStr = payloadTypeFileStr.replace(/(WorkerReponse\s{)/, `$1${appendResponseTypeStr}`);

    fs.writeFileSync(config.payloadTypeFilePath, payloadTypeFileStr, 'utf-8');
    console.log('done: 添加新事务的 payload type.');

    return true;
};

module.exports = insertInfo;
