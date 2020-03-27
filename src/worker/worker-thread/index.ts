/*
 * Worker 线程的 Worker 业务
 *
 * 这个文件是 Worker js 源码打包入口.
 * 在 Worker 线程, 其全局环境就是 Worker 实例, 所以只需要实例化一次 WorkerThreadWorker.
 * Worker 线程是被动启动的线程. 多个 Worker 实例, 通过主线程多次实例化 AlloyWorker 实现.
 */

import Controller from './controller';
import WorkerAbilityTest from './worker-ability-test';

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
    workerAbilityTest: WorkerAbilityTest;

    constructor() {
        this.controller = new Controller();

        this.workerAbilityTest = new WorkerAbilityTest(this.controller);
    }
}

// 新建 Worker 线程的 AlloyWorker
const alloyWorker = new WorkerThreadWorker();

// 将 alloyWorker 挂载到 Worker 线程的全局环境, 可用于调试
// @ts-ignore
self.alloyWorker = alloyWorker;

// Worker 线程中代码可以直接引用 Worker 业务
export default alloyWorker;
