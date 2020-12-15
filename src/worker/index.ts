/*
 * Create Alloy Worker Instance
 */

import type { IAlloyWorkerOptions } from './type';
import { CommunicationTimeout, HeartBeatCheckStartDelay } from './config';
import MainThreadWorker from './main-thread/index';

/**
 * 创建 Alloy Worker 的工厂函数
 *
 * @param options 工厂函数参数
 * @returns {MainThreadWorker} Alloy Worker 实例
 */
export default function createAlloyWorker(options: Omit<IAlloyWorkerOptions, 'workerUrl'>): MainThreadWorker {
    /**
     * 主线程代码和 Worker 线程代码可以在同一个文件/函数中调用(即同构)
     * 在 Worker 线程中引入主线程代码, 在该 Worker 线程 createAlloyWorker 会新建一个 Worker 线程
     * 新的 Worker 线程会再次新建, 导致"循环调用"
     */
    // 主线程才去实例化 Worker, Worker 线程直接返回
    if (__WORKER__) {
        // @ts-ignore
        return;
    }

    // 传递 Worker 调试参数
    // 如果显式传递 true, 启用调试模式; 支持通过 url 传递启用标志来启用
    const isDebugMode = options.isDebugMode || location.href.indexOf('debugWorker=true') >= 0;

    const mainThreadWorker = new MainThreadWorker({
        ...options,
        isDebugMode,
        workerUrl: getWorkerUrl(isDebugMode),
    });

    // 无法实例化 Worker, 不能再去检测 Worker 能力了, 会报错
    if (!mainThreadWorker.canNewWorker) {
        // 上报
        mainThreadWorker.reportWorkerStatus();
        return mainThreadWorker;
    }

    // Worker 通信能力测试
    runWorkerAbilityTest(mainThreadWorker);

    return mainThreadWorker;
}

/**
 * 从全局获取 worker url, 并且根据页面 url 参数设置 worker url 参数
 *
 * @param isDebugMode
 */
function getWorkerUrl(isDebugMode: boolean): string {
    /** worker url 会在构建时替换掉
     * dev: 'WORKER_FILE_NAME_PLACEHOLDER' -> 'alloy-worker.js'
     * dist: 'WORKER_FILE_NAME_PLACEHOLDER' -> 'alloy-worker-51497b48.js'
     */
    let workerUrl = './WORKER_FILE_NAME_PLACEHOLDER';
    if (!isDebugMode) {
        return workerUrl;
    }

    // 通过 Worker url 传递调试参数到 Worker 线程中
    const debugModeSearch = `debugWorker=true`;
    workerUrl = workerUrl.indexOf('?') > 0 ? `${workerUrl}&${debugModeSearch}` : `${workerUrl}?${debugModeSearch}`;

    return workerUrl;
}

/**
 * 进行 worker 通信能力测试
 *
 * @param mainThreadWorker
 */
function runWorkerAbilityTest(mainThreadWorker: MainThreadWorker) {
    // 等待通信超时后上报
    // 为了可用性, 通信超时后并不会结束等待, 而是打点上报
    // 正常不会走到事务的 .catch 逻辑, 所以需要独立设置超时上报
    const firstCommunicationTimeoutHandle = setTimeout(() => {
        mainThreadWorker.reportWorkerStatus();
    }, CommunicationTimeout);

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

    // 心跳检测, 延迟启动
    // 避免打开页面时主线程的同步逻辑阻塞 Worker js 加载; 也等待 Worker 线程启动完
    setTimeout(() => {
        mainThreadWorker.startHeartBeatCheck();
    }, HeartBeatCheckStartDelay);
}
