const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname, '../../'),
    roots: ['<rootDir>/', '<rootDir>/test/'],
    verbose: true,
    // Jest 环境准备好后的拓展脚本
    setupFilesAfterEnv: [
        // https://github.com/kulshekhar/ts-jest/issues/281#issuecomment-546337648
        // 解决引入的 enum .ts 文件单测中提示 undefined
        'core-js',
        '<rootDir>/script/test/setup.ts',
    ],
    testMatch: [
        '<rootDir>/test/unit/**/*.(spec|test).(js|ts)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/script/',
    ],
    // 使用 ts-jest 来执行 typescript 编写的测试用例
    transform: {
        '.*\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        // glob模式，非正则模式
        'src/**/*.{js,ts}',
        // 忽略生成新事务脚本
        '!src/worker/one-script/**/*.{js,ts}',
        // 忽略测试页面
        '!src/page/**/*.{js,ts}',
        // 忽略 plugin
        '!src/plugin/**/*.{js,ts}',
        // 忽略 command
        '!src/command/**/*.{js,ts}',
        '!**/*.d.ts',
        '!**/test/**',
        '!**/dist/**',
    ],
    coverageReporters: ['text', 'lcov', 'clover', 'json'],
    reporters: ['default'],
    moduleNameMapper: {
        '^test/(.*)$': '<rootDir>/test/$1',
        '^worker/(.*)$': '<rootDir>/src/worker/$1',
        '^alloy-worker\!(.*)$': '<rootDir>/test/__mocks__/alloy-worker-mock.js',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/test/tsconfig.json',
            // https://kulshekhar.github.io/ts-jest/user/config/babelConfig
            babelConfig: true,
        },
    },
};
