/*
 * Create Alloy Worker Instance
 */

import { IAlloyWorkerOptions } from './type';
import MainThreadWorker from './main-thread/index';

/**
 * 创建 Alloy Worker 的工厂函数
 *
 * @param options 工厂函数参数
 * @returns {MainThreadWorker} Alloy Worker 实例
 */
export default function createAlloyWorker(options: IAlloyWorkerOptions): MainThreadWorker {
    const mainThreadWorker = new MainThreadWorker(options);

    return mainThreadWorker;
}


