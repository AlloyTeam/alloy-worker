# alloy-worker

> 面向事务的高可用 Web Worker 通信框架.

腾讯 [AlloyTeam](https://github.com/AlloyTeam) 出品, 经受住腾讯文档等复杂前端项目的考验.

## 特点

* 面向事务及命名空间的通信封装, 支持大规模业务的场景.
* Promise 化调用代替跨线程事件监听, 无缝支持 async, await.
* 完整的 Worker 可用性监控指标; 全链路 Worker 错误监控.
* 源码全 TypeScript, 跨线程数据类型一致性校验.
* 跨线程请求和响应的数据流调试.
* 良好支持 IE10+ 浏览器.

*更多详细信息请查看[Alloy Worker 技术细节][Alloy Worker 技术细节].*

# Demo
* Web Worker 能力测试
> https://todo.com

* Worker 图像处理 Demo
> https://todo.com

## 接入方式

### 让 Alloy Worker 融为项目源码

Web Worker 需要打包为独立文件, 并且你的业务代码也会打包进去; 所以 Alloy Worker **并不是一个 npm 安装包**. 它要你手动将它融合到你的项目源码里; 好在手动也并不复杂, 而且它不会入侵你的现有业务.

Alloy Worker 本身是对原始 Web Worker 能力的 RPC 封装, 并在使用方式上给出约定. 接入其实是完成一件单纯的事情: **帮你初始化项目中的 Worker 源码**. 初始化源码后, Web Worker 就是项目的一项基础能力, 你可以自由地去使用和修改它.

我们使用一个已有项目 - [template](https://github.com/CntChen/template) - 为例子来了解如何手动融合 Alloy Worker.

### 下载源码
将 template 和 alloy-worker clone 到同级目录

```sh
$ cd /path/to/test
$ git clone https://github.com/CntChen/template.git
$ git clone https://github.com/CntChen/alloy-worker.git
```

### 复制需要的源码

template 中需要的 alloy-worker 源码在 alloy-worker 的 `src/worker` 目录, 复制到 template 的对应目录.

```sh
$ cd /path/to/test
$ cp -r ./alloy-worker/src/worker ./template/src
```

### 添加 Worker 的独立构建脚本

我们知道 Web Worker 需要打包为独立的 js 资源, alloy-worker 已经提供了打包脚本, 迁移过去.

```sh
$ cd /path/to/test
$ cp -rf alloy-worker/worker-script ./template
```

我们需要看下 `pipeline-template/scirpt/project.config.js`, 其中定义了一些构建的配置. alloy-worker 的默认输出目录 `outputPath = ./dist`, 如果 pipeline-template 不是, 需要对齐 pipeline-template.

然后在 `` 中可以看到 Web Worker 构建的 webpack 配置: `script/worker.webpack.config.js`.

### 把 Web Worker 构建配置纳入构建流程

// TODO
```diff
+ const workerConfig = require('../worker-script/worker.webpack.config');
const pcConfig = ...
const mobileConfig = ...

-const compiler = webpack([pcConfig, mobileConfig].filter(c => !!c));
+const compiler = webpack([workerConfig, pcConfig, mobileConfig].filter(c => !!c));
```

### 跑构建

webpackv4.

安装一些可能之前没有的依赖.
```sh
$ npm i webpack-manifest-plugin -D

```


## 业界方案对比

| 项目 | 简介 | 底层API封装 | 事务声明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: |
| [Worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ❌ | ❌ | ❌ | ❌ |
| [Promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✔️ | ❌ | ❌ | ❌ |
| [Comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队开源, worker 打包 plugin | ✔️ | 跨线程同名函数 | ❌ | ❌ |
| **Alloy-worker** | 面向事务, 高可以用的 Worker 通信框架 | 通信️控制器 | 同名函数, TypeScirpt 声明 | 完整监控指标, 全周期错误监控 | 命名空间 |

## 贡献源码


## 相关文档

* Alloy Worker 接入指南
> https://todo.com

* Alloy Worker 技术细节
> https://todo.com

* Web Worker 文献综述 2020
> https://todo.com

* 朝花夕拾: Web Worker 大型前端项目实践
> https://todo.com

## TODO
* 代码中的 TODO 清理
* __WORKER__ 判断与 isWorker

##　EOF
