# 参与开发

请先阅读 `src/docs` 中的技术文档.

## 如何调试源码
在终端中构建 alloy-worker 源码:
```sh
$ npm run dev
```

`src/page` 中有一个简单的调试页面. 在另一个终端中代理页面:
```sh
$ npx http-server -c0 ./dist
Available on:
  http://127.0.0.1:8080
```

打开 http://127.0.0.1:8080 查看页面.

## 如何修改构建脚本
Alloy-worker 的构建脚本路径和正常前端项目有差异: 脚本在 `./script` 和 `./worker-script` 2 个目录中. 其中:
* `./script` 只在 alloy-worker 项目内部使用.
* `./worker-script` 除了内部使用, 还兼顾融合到其他项目时, 复制到其他项目.

## commit 前校验
* 验证 dist 构建
```sh
$ npm run dist
```

## EOF
