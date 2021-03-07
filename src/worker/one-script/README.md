# 事务模板代码生成脚本
> 通过脚本节省生命.

## 用法
```sh
$ node path/to/one-script/index.js worker-action-demo

输入的事务名称: worker-action-demo. 

新增的事务名称:  worker-action-demo.
事务的纯字母名称: WorkerActionDemo.

done: 生成事务模板代码.
done: 添加新事务的 aciton type.
done: 添加新事务的 payload type.

新增事务模板代码完成.
请在主线程和 Worker 线程各自引用和实例化该事务.
然后修改事务的 action, payload 类型声明, 并编写业务逻辑.
```

## 生成模板代码

```js
$ git status
    // 添加事务声明和通信负载声明
    modified:   src/worker/common/action-type.ts
    modified:   src/worker/common/payload-type.ts
    // 主线程和 Worker 线程实例化事务
    modified:   src/worker/main-thread/index.ts
    modified:   src/worker/worker-thread/index.ts

    // 生成新模块源码
    added: src/worker/main-thread/worker-action-demo.ts
    added: src/worker/worker-thread/worker-action-demo.ts
```

## 验证新事务

根据项目 README 重启构建. 然后打开页面控制台.

假如命令行输入的事务名称为 `worker-action-demo`, 则调用的事务名称为 `alloyWorker.workerActionDemo`.

发起跨线程通信实例:
```js
> alloyWorker.workerActionDemo.mainCallWorker('hello').then(console.error)
...
hello, from Worker Thread. // console.error
```

## EOF
