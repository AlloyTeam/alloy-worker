module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true,
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        'alloy',
        'alloy/typescript',
    ],
    globals: {
        __WORKER__: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            strict: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        "@typescript-eslint/eslint-plugin"
    ],
    rules: {
        "@typescript-eslint/ban-ts-ignore": 0,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/no-namespace": 0,
        "@typescript-eslint/consistent-type-definitions": 0,
    },
};
