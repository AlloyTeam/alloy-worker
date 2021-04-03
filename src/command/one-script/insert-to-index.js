const fs = require('fs');
const path = require('path');
const config = require('./config');

const insertToIndex = (actionName, pureActionName) => {
    const insertNewActionLine = (originStr) => {
        const ReplaceMap = [
            {
                from: 'AlloyWorkerActionName',
                to: actionName,
            },
            {
                from: 'AlloyWorkerPureActionName',
                to: pureActionName,
            },
            {
                from: 'AlloyWorkerPureActionNameLowerCase',
                to: pureActionName.replace(/^./, pureActionName[0].toLowerCase()),
            },
        ];

        const newStr = originStr.replace(
            /\n(\s*)\/\/\s?AlloyWorkerAutoInsert:\s?([\w\W]*?)(?=\n)/g,
            (match, p1, p2) => {
                // match 完整匹配, p1: 注释行的缩进, p2 插入的模板字符串
                let instertedStr = p2;
                ReplaceMap.forEach((item) => {
                    const replaceFromReg = new RegExp(`<%=${item.from}%>`, 'g');
                    instertedStr = instertedStr.replace(replaceFromReg, item.to);
                });

                return `\n${p1}${instertedStr}${match}`;
            }
        );

        return newStr;
    };

    // 主线程入口添加新事务声明和实例化代码
    const mainThreadIndexPath = path.join(config.mainThreadTargetDir, 'index.ts');
    const newMainThreadIndexFileStr = insertNewActionLine(fs.readFileSync(mainThreadIndexPath, 'utf-8').toString());
    fs.writeFileSync(mainThreadIndexPath, newMainThreadIndexFileStr, 'utf-8');
    console.log('done: 添加新事务到主线程入口.');

    // Worker 线程入口添加新事务声明和实例化代码
    const workerThreadIndexPath = path.join(config.workerThreadTargetDir, 'index.ts');
    const newWorkerThreadIndexFileStr = insertNewActionLine(fs.readFileSync(workerThreadIndexPath, 'utf-8').toString());
    fs.writeFileSync(workerThreadIndexPath, newWorkerThreadIndexFileStr, 'utf-8');
    console.log('done: 添加新事务到 Worker 线程入口.');

    return true;
};

module.exports = insertToIndex;
