/*
 * Create Alloy Worker Instance
 */

import { IAlloyWorkerOptions } from './type';
import MainThreadWorker from './main-thread/index';
import {
    CommunicationTimeout,
} from './common/config';

/**
 * 创建 Alloy Worker 的工厂函数
 *
 * @param options 工厂函数参数
 * @returns {MainThreadWorker} Alloy Worker 实例
 */
export default function createAlloyWorker(options: IAlloyWorkerOptions): MainThreadWorker {
    // TODO 移除判断
    // 主线程才去上报
    // if (!__WORKER__) {

    const mainThreadWorker = new MainThreadWorker(options);

    // 无法实例化 Worker, 不能再去检测 Worker 能力了, 会报错
    if (!mainThreadWorker.canNewWorker) {
        // 上报
        mainThreadWorker.reportWorkerStatus();
    } else {
        let firstCommunicationTimeoutHandle: number;
        // 默认 worker 才进行 worker 能力上报
        // 上报 worker 信息
        mainThreadWorker.workerAbilityTest
            .communicationTest()
            .then((workerGetMessageDuration: number) => {
                const timeWorkerReplyMessage = Date.now();
                clearTimeout(firstCommunicationTimeoutHandle);

                mainThreadWorker.reportWorkerStatus(true, timeWorkerReplyMessage);
            })
            .catch((error) => {
                // TODO 是不是可以去掉
                // 首次通信 timeout 错误
                console.log('First communication timeout:', error);
            });

        // 等待通信超时后上报
        // 为了可用性, 通信超时后并不会结束等待, 而是打点上报
        // 正常不会走到事务的 .catch 逻辑, 所以需要独立设置超时上报
        firstCommunicationTimeoutHandle = setTimeout(() => {
            mainThreadWorker.reportWorkerStatus();
        }, CommunicationTimeout);
    }

    return mainThreadWorker;
}


