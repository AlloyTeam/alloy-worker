/*
 * 在主线程目录和 Worker 线程目录生成事务模板代码
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const generateFiles = (actionName, pureActionName) => {
    const TemplateReplaceMap = [
        {
            from: 'WorkerActionName',
            to: pureActionName,
        },
    ];

    /**
     * 从模板文件生成目标文件, 并替换其中的占位符
     */
    const generateFileFromTemplate = (originFilePath, targerFilePath) => {
        const originFileStr = fs.readFileSync(originFilePath, 'utf-8');

        let targetFileStr = originFileStr;
        TemplateReplaceMap.forEach((item) => {
            const replaceFromReg = new RegExp(`<%=${item.from}%>`, 'g');
            targetFileStr = targetFileStr.replace(replaceFromReg, item.to);
        });

        // 写到目录路径
        return fs.writeFileSync(targerFilePath, targetFileStr, 'utf-8');
    };

    const mainThreadTargeFilePath = path.join(config.mainThreadTargetDir, `./${actionName}.ts`);
    generateFileFromTemplate(config.mainThreadTemplatePath, mainThreadTargeFilePath);

    const workerThreadTargeFilePath = path.join(config.workerThreadTargetDir, `./${actionName}.ts`);
    generateFileFromTemplate(config.workerThreadTemplatePath, workerThreadTargeFilePath);

    console.log('done: 生成事务模板代码.');

    return true;
};

module.exports = generateFiles;
