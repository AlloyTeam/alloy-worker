// jest-puppeteer.config.js
module.exports = {
    server: {
        // 启动生产模式构建, 并通过 http-server 启动本地访问
        command: 'npm run dist && http-server -p 6842 -c0 ./dist',
        port: 6842,
        launchTimeout: 20000,
    },
}
