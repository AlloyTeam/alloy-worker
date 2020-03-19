/*
 * 主线程的 Worker 业务
 */

import { IAlloyWorkerOptions } from '../type';
import Controller from './controller';

 export default class MainThreadWorker {
    /**
     * 主线程通信控制器
     */
    private controller: Controller;

    constructor(options: IAlloyWorkerOptions) {
        this.controller = new Controller(options);
    }
 }

