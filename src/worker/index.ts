/*
 * Create Alloy Worker Instance
 */

import { IAlloyWorkerOptions } from './type';
import MainThreadWorker from './main-thread/index';

/**
 * 创建 Alloy Worker 的工厂函数
 *
 * @export
 * @param {IAlloyWorkerOptions} options
 * @returns {MainThreadWorker}
 */
export default function createAlloyWorker(options: IAlloyWorkerOptions): MainThreadWorker {
    const mainThreadWorker = new MainThreadWorker(options);

    return mainThreadWorker;
}


