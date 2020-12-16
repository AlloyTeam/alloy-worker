const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname, '../../'),
    // Jest 环境准备好后的拓展脚本
    preset: 'jest-puppeteer',
    testMatch: [
        '<rootDir>/test/e2e/**/*.(spec|test).(js|ts)',
    ],
    // 使用 ts-jest 来执行 typescript 编写的测试用例
    transform: {
        '.*\\.ts$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/test/tsconfig.json',
            // https://kulshekhar.github.io/ts-jest/user/config/babelConfig
            babelConfig: true,
        },
    },
};
