module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        "plugin:@typescript-eslint/recommended"
    ],
    globals: {
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

    },
};
