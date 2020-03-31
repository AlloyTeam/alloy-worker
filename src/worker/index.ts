/*
 * Create Alloy Worker Instance
 */

import { IAlloyWorkerOptions } from './type';
import { CommunicationTimeout, HeartBeatCheckStartDelay } from './config';
import MainThreadWorker from './main-thread/index';
import HeartBeatCheck from './heart-beat-check';

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
        let firstCommunicationTimeoutHandle: number = undefined;
        // 默认 worker 才进行 worker 能力上报
        // 上报 worker 信息
        mainThreadWorker.workerAbilityTest
            .communicationTest()
            .then((workerGetMessageDuration: number) => {
                const timeWorkerReplyMessage = Date.now();
                clearTimeout(firstCommunicationTimeoutHandle);

                if (mainThreadWorker.controller.isDebugMode) {
                    console.log(`%cFirst comunication duration: ${workerGetMessageDuration}ms`, 'color: orange');
                }

                const isTimeout = workerGetMessageDuration > CommunicationTimeout;
                mainThreadWorker.reportWorkerStatus(isTimeout, timeWorkerReplyMessage);
            })
            .catch((error) => {
                if (mainThreadWorker.controller.isDebugMode) {
                    // 首次通信 timeout 错误
                    console.error(`%cFirst communication timeout: ${error}`, 'color: orange');
                }
            });

        // 等待通信超时后上报
        // 为了可用性, 通信超时后并不会结束等待, 而是打点上报
        // 正常不会走到事务的 .catch 逻辑, 所以需要独立设置超时上报
        firstCommunicationTimeoutHandle = setTimeout(() => {
            mainThreadWorker.reportWorkerStatus();
        }, CommunicationTimeout);

        // 心跳检测, 延迟启动
        // 避免打开页面时主线程的同步逻辑阻塞 Worker js 加载; 也等待 Worker 线程启动完
        setTimeout(() => {
            const heartBeatCheck = new HeartBeatCheck(mainThreadWorker);
            heartBeatCheck.start();
        }, HeartBeatCheckStartDelay);
    }

    return mainThreadWorker;
}
