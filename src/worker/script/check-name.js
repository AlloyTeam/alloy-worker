/*
 * 事务文件名校验和重名校验
 */

const fs = require('fs');
const config = require('./config');

const checkName = (actionName) => {
    // 事务名称规范检查
    const nameVeridate = (actionName) => {
        if (/^[-_a-zA-Z]*$/.test(actionName)) {
            return true;
        }
        return false;
    };
    const isNameVeridate = nameVeridate(actionName);

    if (!isNameVeridate) {
        console.error('需要添加正确的事务名称作为参数.');
        console.error('事务名称为字母, `_`, `-` 的组合.');
        console.error('事务名称示例: `worker-ability-test`, `cookie` 等.');
        return false;
    }

    // 事务是否已经存在检查
    const actionExist = (actionName) => {
        const existedActionsName = fs.readdirSync(config.mainThreadTargetDir, 'utf-8');
        return existedActionsName.some((name) => {
            return (
                `${actionName.toLowerCase()}.ts` === name.toLowerCase() ||
                `${actionName.toLowerCase().replace(/[_-]/g, '')}.ts` === name.toLowerCase().replace(/[_-]/g, '')
            );
        });
    };
    const isActionExist = actionExist(actionName);

    if (isActionExist) {
        console.error(`事务 \`${actionName}\` 已经存在, 请换个名称.`);
        return false;
    }

    return true;
};

module.exports = checkName;
