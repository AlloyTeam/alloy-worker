# alloy-worker

> 面向事务的高可用 Web Worker 通信框架.

腾讯 [AlloyTeam](https://github.com/AlloyTeam) 出品, 经受住腾讯文档等大型前端项目的考验.

## 特点

* 面向事务及命名空间的通信封装, 支持大规模业务的场景.
* Promise 化调用代替跨线程事件监听, 无缝支持 async/await.
* 完整的 Worker 可用性监控指标; 全周期 Worker 错误监控.
* 源码全 TypeScript, 跨线程数据类型一致性校验.
* 跨线程请求和响应的数据流调试.
* 良好支持 IE10+ 浏览器.
* 独立打包的构建支持, 无需自行配置.

## 业界方案对比

| 项目 | 简介 | 构建打包 | 底层API封装 | 跨线程调用申明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: | :-: |
| [worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ✔️ | ✘ | ✘ | ✘ | ✘ |
| [promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✘ | ✔️ | ✘ | ✘ | ✘ |
| [comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队, 通信 RPC 封装 | ✘ | ✔️ | 同名函数(基于Proxy) | ✘ | ✘ |
| [workerize-loader](https://github.com/developit/workerize-loader) | 社区目前比较完整的方案 | ✔️ | ✔️ | 同名函数(基于AST生成) | ✘ | ✘ |
| [alloy-worker](https://github.com/AlloyTeam/alloy-worker) | 面向事务的高可用 Worker 通信框架 | 提供构建脚本 | 通信️控制器 | 同名函数(基于约定), TS 声明 | 完整监控指标, 全周期错误监控 | 命名空间, 事务生成脚本 |

## Demo
* [Web Worker 能力测试](https://alloyteam.github.io/alloy-worker/index.html)

![](https://user-images.githubusercontent.com/4598445/87221688-8a423580-c3a0-11ea-9aef-d8028fdc4969.gif)

* [图像处理 Demo](https://alloyteam.github.io/alloy-worker/image.html)

[![](https://user-images.githubusercontent.com/4598445/87221671-61ba3b80-c3a0-11ea-9a13-d43f271519af.jpg)](https://alloyteam.github.io/alloy-worker/docs/img/image-demo.mp4)
*(图片上右键新窗口打开可查看视频)*

## 代码示例

以 Worker 线程发起跨线程调用到主线程取页面 cookie 为例.

![](https://user-images.githubusercontent.com/4598445/87221679-7696cf00-c3a0-11ea-865c-66b174a8744a.jpg)

## 用法
### 本地调试
```sh
$ git clone https://github.com/AlloyTeam/alloy-worker.git
$ git checkout demo
$ npm install && npm run dist
$ npx http-server -c0 ./dist
Available on:
  http://127.0.0.1:8080
```

打开 http://127.0.0.1:8080 和 http://127.0.0.1:8080/image.html 进行本地调试.

### 接入

Alloy-worker **并不是一个 npm 包**. 需要你手动将它融合到你的项目里, 并成为项目源码的一部分. 好在手动也不复杂, 而且不会影响现有业务.

接入步骤, [请查看这里][alloy-worker 接入教程].

### 使用

Alloy-worker 对原始 Web Worker 通信能力进行了 RPC 封装, **约定了 Worker 代码组织方式**. 使用 alloy-worker 开发 Worker 侧业务时, 需对齐 [alloy-worker 的约定][alloy-worker 代码约定].

约定不复杂, [请查看这里][alloy-worker 使用教程].

## 使用反馈

如果你的项目使用 alloy-worker 并觉得它不错, 请到 [这里](https://github.com/AlloyTeam/alloy-worker/issues/1) 告诉我们.

## 贡献源码

请查看[参与开发](./CONTRIBUTING.md).

## 相关文档

[alloy-worker 接入教程]: https://github.com/AlloyTeam/alloy-worker/wiki/alloy-worker-%E6%8E%A5%E5%85%A5%E6%95%99%E7%A8%8B
* [alloy-worker 接入教程][alloy-worker 接入教程]

[alloy-worker 代码约定]: https://github.com/AlloyTeam/alloy-worker/wiki/alloy-worker-%E4%BB%A3%E7%A0%81%E7%BA%A6%E5%AE%9A
* [alloy-worker 代码约定][alloy-worker 代码约定]

[alloy-worker 使用教程]: https://github.com/AlloyTeam/alloy-worker/wiki/alloy-worker-%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B
* [alloy-worker 使用教程][alloy-worker 使用教程]

[alloy-worker 技术细节]: https://github.com/AlloyTeam/alloy-worker/wiki/alloy-worker-%E6%8A%80%E6%9C%AF%E7%BB%86%E8%8A%82
* [alloy-worker 技术细节][alloy-worker 技术细节]

* [Web Worker 文献综述](https://github.com/CntChen/cntchen.github.io/issues/19)

* 朝花夕拾: Web Worker 大型前端项目实践
> https://todo.com

## TODO
* 兼容 webpack5 构建
* 解决纯 worker 侧代码更新的 hash 问题
* sourcemap 区分不同线程的源码

## EOF
