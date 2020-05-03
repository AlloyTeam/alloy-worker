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

## 代码示例


## 使用
* 接入方式
* 用法


## 业界方案对比

| 项目 | 简介 | 底层API封装 | 事务声明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: |
| [Worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ❌ | ❌ | ❌ | ❌ |
| [Promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✔️ | ❌ | ❌ | ❌ |
| [Comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队开源, worker 打包 plugin | ✔️ | 跨线程同名函数 | ❌ | ❌ |
| **Alloy-worker** | 面向事务, 高可以用的 Worker 通信框架 | 通信️控制器 | 同名函数, TypeScirpt 声明 | 完整监控指标, 全周期错误监控 | 命名空间 |

## 贡献源码
> [参考开发](./CONTRIBUTING.md).

## 相关文档

* Alloy Worker 接入教程
> https://todo.com

* Alloy Worker 使用方式
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

## EOF
