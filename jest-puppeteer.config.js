// jest-puppeteer.config.js
module.exports = {
    server: {
      command: 'npm run dist && http-server -p 6842 -c0 ./dist',
      port: 6842,
      launchTimeout: 20000,
    },
  }
