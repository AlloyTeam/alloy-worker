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

*想了解更多技术点, 请查看 [alloy-worker 技术细节][alloy-worker 技术细节].*

## 业界方案对比

| 项目 | 简介 | 构建打包 | 底层API封装 | 跨线程调用申明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: | :-: |
| [worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ✔️ | ✘ | ✘ | ✘ | ✘ |
| [promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✘ | ✔️ | ✘ | ✘ | ✘ |
| [comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队, 通信 RPC 封装 | ✘ | ✔️ | 同名函数(基于Proxy) | ✘ | ✘ |
| [workerize-loader](https://github.com/developit/workerize-loader) | 社区目前比较完整的方案 | ✔️ | ✔️ | 同名函数(基于AST生成) | ✘ | ✘ |
| **alloy-worker** | 面向事务的高可用 Worker 通信框架 | 提供构建脚本 | 通信️控制器 | 同名函数(基于约定), TS 声明 | 完整监控指标, 全周期错误监控 | 命名空间, 事务生成脚本 |

## Demo
* Web Worker 能力测试
> https://alloyteam.github.io/alloy-worker/dist/index.html

![](./docs/img/worker-ability-test.gif)

* Worker 图像处理 Demo
> https://alloyteam.github.io/alloy-worker/dist/image.html

## 代码示例

* 主线程实例化 alloy-worker.

```js
// src/index.ts

import createAlloyWorker from '../worker/index';

// 实例化
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});
// 跨线程 Promise 调用
alloyWorker.workerAbilityTest.communicationTest().then(console.log);
```

* 主线程发起跨线程调用.

```js
// src/worker/main-thread/worker-ability-test.ts

export default class WorkerAbilityTest {
    communicationTest() {
        const mainThreadPostTime: = Date.now();
        // this.controller 为通信控制器
        return this.controller.requestPromise(
            WorkerAbilityTestActionType.CommunicationTest,
            mainThreadPostTime);
    }
}
```

* Worker 线程收到请求并返回结果.

```js
// src/worker/worker-thread/worker-ability-test.ts

export default class WorkerAbilityTest {
    CommunicationTest(payload) {
        // 获取主线程传递的数据
        const mainThreadPostTime = payload;
        // 返回发送和接收的时间差
        return Date.now() - mainThreadPostTime;
    }
}
```

## 用法

### 接入

Alloy-worker **并不是一个 npm 包**. 需要你手动将它融合到你的项目里, 并成为项目源码的一部分. 好在手动也不复杂, 而且不会影响现有业务.

接入步骤, [请查看这里][alloy-worker 接入教程].

### 使用

Alloy-worker 对原始 Web Worker 通信能力进行了 RPC 封装, **约定了 Worker 代码组织方式**. 使用 alloy-worker 开发 Worker 侧业务时, 需对齐 alloy-worker 的约定.

约定不复杂, [请查看这里][alloy-worker 使用教程].

## 使用反馈

如果你的项目使用 alloy-worker 并觉得它不错, 请到 [这里](https://github.com/AlloyTeam/alloy-worker/issues/1) 告诉我们.

## 贡献源码

请查看[参与开发](./CONTRIBUTING.md).

## 相关文档

[alloy-worker 接入教程]: ./docs/alloy-worker%20%E6%8E%A5%E5%85%A5%E6%95%99%E7%A8%8B.md
* [alloy-worker 接入教程][alloy-worker 接入教程]

[alloy-worker 使用教程]: ./docs/alloy-worker%20%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B.md
* [alloy-worker 使用教程][alloy-worker 使用教程]

[alloy-worker 技术细节]: ./docs/alloy-worker%20%E6%8A%80%E6%9C%AF%E7%BB%86%E8%8A%82.md
* [alloy-worker 技术细节][alloy-worker 技术细节]

* Web Worker 文献综述
> https://todo.com

* 朝花夕拾: Web Worker 大型前端项目实践
> https://todo.com

## TODO
* 兼容 webpack5 构建
* 解决纯 worker 侧代码更新的 hash 问题

## EOF
