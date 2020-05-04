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
// TODO GIF

* Worker 图像处理 Demo
> https://todo.com
// TODO GIF

## 代码示例

`src/pc/index.ts`
```js
import createAlloyWorker from '../worker/index';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});

alloyWorker.workerAbilityTest.communicationTest().then(res => {
    console.log(`result:`, res); // result: 135
});
```

`src/worker/main-thread/worker-ability-test.ts`
```js
export default class WorkerAbilityTest extends BaseAction {
    communicationTest() {
        const mainThreadPostTime: = Date.now();
        return this.controller.requestPromise(WorkerAbilityTestActionType.CommunicationTest, mainThreadPostTime);
    }
}
```

`src/worker/worker-thread/worker-ability-test.ts`
```js
export default class WorkerAbilityTest extends BaseAction {
    protected addActionHandler() {
        this.controller.addActionHandler(
            WorkerAbilityTestActionType.CommunicationTest,
            this.CommunicationTestHandler.bind(this)
        );
    }

    private CommunicationTestHandler(payload): WorkerReponse.WorkerAbilityTest.CommunicationTest {
        const mainThreadPostTime = payload;
        // 收到主线程信息的耗时
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }
}
```


## 用法
### 接入

Alloy-worker **并不是一个 npm 包**. 它需要你手动将它融合到你的项目源码里, 并成为你项目源码的一部分. 好在手动也并不复杂, 而且它不会入侵你的现有业务.

接入步骤请查看[这里](https://todo.com).

### 使用
Alloy-worker 是对原始 Web Worker 能力的 RPC 封装, 也是 **Worker 代码组织方式的约定**. 基于 alloy-worker 开发新业务时, 需按照 Alloy-worker 的约定去编写代码. 约定不复杂, 请查看[这里](https://todo.com).

## 业界方案对比

| 项目 | 简介 | 底层API封装 | 事务声明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: |
| [Worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ❌ | ❌ | ❌ | ❌ |
| [Promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✔️ | ❌ | ❌ | ❌ |
| [Comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队开源, worker 打包 plugin | ✔️ | 跨线程同名函数 | ❌ | ❌ |
| **Alloy-worker** | 面向事务, 高可以用的 Worker 通信框架 | 通信️控制器 | 同名函数, TypeScirpt 声明 | 完整监控指标, 全周期错误监控 | 命名空间 |

## 贡献源码
> [参与开发](./CONTRIBUTING.md).

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
