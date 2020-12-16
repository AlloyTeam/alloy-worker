/*
 * Create Alloy Worker Instance
 */

import type { IAlloyWorkerOptions } from './type';
import { ReportProxy } from './external/report-proxy';
import report from './external/report';
import MainThreadWorker from './main-thread/index';

/**
 * 主线程, 将上报代理替换为真实上报模块
 * 只需替换一次, 所以放在 Alloy Worker 入口
 */
ReportProxy.eachLoad(report);

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

    // Worker 状态监测
    mainThreadWorker.startWorkerStatusCheck();

    return mainThreadWorker;
}

/**
 * 从全局获取 worker url, 并且根据页面 url 参数设置 worker url 参数
 *
 * @param isDebugMode
 */
export function getWorkerUrl(isDebugMode: boolean): string {
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
