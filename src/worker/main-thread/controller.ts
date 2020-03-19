/*
 * 主线程通信控制器
 */

import { IAlloyWorkerOptions } from '../type.d';

export default class Controller {
     /**
     * worker 实例
     */
    private worker: Worker;

    constructor(options: IAlloyWorkerOptions) {
        this.worker = new Worker(options.workerUrl, {
            name: options.workerName,
        });
    }
}
