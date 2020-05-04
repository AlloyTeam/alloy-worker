# 事务模板代码生成脚本
> 通过脚本节省生命.

## 用法

* 运行示例
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

* 生成模板代码

```js
$ git status

    modified:   src/worker/common/action-type.ts
    modified:   src/worker/common/payload-type.ts

    added: src/worker/main-thread/worker-action-demo.ts
    added: src/worker/worker-thread/worker-action-demo.ts
```

## EOF
