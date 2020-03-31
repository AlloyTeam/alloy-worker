/*
 * Worker 线程的 Worker 业务
 *
 * 这个文件是 Worker js 源码打包入口.
 * 在 Worker 线程, 其全局环境就是 Worker 实例, 所以只需要实例化一次 WorkerThreadWorker.
 * Worker 线程是被动启动的线程. 多个 Worker 实例, 通过主线程多次实例化 AlloyWorker 实现.
 */

/**
 * Worker 线程名称的兼容
 * 部分浏览器, 如 IE10, IE11 的 self.name 为 undefined, 无法区分不同 Worker 线程
 */
// @ts-ignore
self.name = self.name || `worker_${Date.now().toString().slice(-6)}`;

import Controller from './controller';
import WorkerAbilityTest from './worker-ability-test';
import Raven from './raven';

/**
 * Worker 线程的 Alloy Worker Class
 *
 * @class WorkerThreadWorker
 */
class WorkerThreadWorker {
    /**
     * Worker 线程通信控制器
     */
    private controller: Controller;

    // 各种业务的实例
    workerAbilityTest: WorkerAbilityTest;
    raven: Raven;

    constructor() {
        this.controller = new Controller();

        this.workerAbilityTest = new WorkerAbilityTest(this.controller);
        this.raven = new Raven(this.controller);
    }
}

// 新建 Worker 线程的 AlloyWorker
const alloyWorker = new WorkerThreadWorker();

// 将 alloyWorker 挂载到 Worker 线程的全局环境, 可用于调试
// @ts-ignore
self.alloyWorker = alloyWorker;

// Worker 线程中代码可以直接引用 Worker 业务
export default alloyWorker;
