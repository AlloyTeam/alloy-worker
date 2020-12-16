// jest-puppeteer.config.js
module.exports = {
    server: {
      command: 'npm run dist && http-server -p 6843 -c0 ./dist',
      port: 6843,
      launchTimeout: 20000,
    },
  }
