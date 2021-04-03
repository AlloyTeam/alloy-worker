#!/usr/bin/env node

const { Command } = require('commander');
const packageInfo = require('../../package.json');
const oneScript = require('./one-script');
const ejectScript = require('./eject-script');

const program = new Command();
program.version(packageInfo.version);

program
    .option('-p, --path <type>', 'set alloy-worker source code eject path')
    .option('-e, eject', 'eject alloy-worker source code to your project')
    .option('-o, one <actionName>', 'generate alloy-worker new action template code');

// 脚本命令参数
const options = program.parse(process.argv).opts();

if (typeof options.one !== 'undefined') {
    const actionName = options.one;
    oneScript(actionName);

    return;
}

if (typeof options.eject !== 'undefined') {
    ejectScript('src/');

    return;
}

console.error('command not found. place try `alloy-worker -h`');
