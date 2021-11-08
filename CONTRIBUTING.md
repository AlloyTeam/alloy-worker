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

## 关联分支
* master, 主干分支.
* demo, 部署 demo 页面分支, 并推送到 gh-pages 分支.
* e2e-test, e2e 分支, 避免 master 构建失败.
* release, 发布 alloy-worker npm 包分支.

## 更新 demo 页面

demo: https://alloyteam.github.io/alloy-worker/index.html

在 `demo` 分支关联了 github action, 专门用于生成 github page, 执行 dist 构建并推送到 `gh-pages` 分支.

```sh
$ git checkout demo
$ git merge master
$ git push
```

## 自动化测试

在 master 分支关联了单元测试, 每次 push 都会执行.

查看: https://github.com/AlloyTeam/alloy-worker/actions/workflows/unit-test.yml

在 `e2e-test` 分支关联了 e2e 测试. 启动测试:

```sh
$ git checkout e2e-test
$ git merge master
$ git push
```

## 发布 npm 包

在 `release` 分支关联了 github action, 专门用于生成 `standard-version`, 并执行 `npm publish`, 再 merge 回 master.

```sh
$ git checkout release
$ git merge master
$ git push
```

## EOF
