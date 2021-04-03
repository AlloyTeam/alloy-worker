/*
 * 通过脚本生成新事务模板代码
 * 使用方法举例:
 * $ node path/to/script/index.js worker-action-demo
 * 其中 `worker-action-demo` 表示事务文件名称
 */

const checkName = require('./check-name');
const generateFile = require('./generate-file');
const insertType = require('./insert-type');
const insertToIndex = require('./insert-to-index');

module.exports = (actionName) => {
    console.log(`输入的事务名称: ${actionName}. \n`);

    // 事务名称检查
    if (!checkName(actionName)) {
        return;
    } else {
        console.log('新增的事务名称: ', `${actionName}.`);
    }

    const pureActionName = actionName
        .split(/[-_]/)
        .map((part) => {
            return part && `${part[0].toUpperCase()}${part.slice(1)}`;
        })
        .join('');
    console.log('事务的纯字母名称:', `${pureActionName}.\n`);

    // 生成事务源码
    generateFile(actionName, pureActionName);

    // 添加事务引用
    insertType(pureActionName);

    // 引入事务和实例化事务
    insertToIndex(actionName, pureActionName);

    console.log('\n新增事务模板代码完成.');
    console.log('请修改事务的 action, payload 类型声明, 并编写业务逻辑.\n');
};
