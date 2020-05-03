/*
 * Worker 可用性上报
 */

export const enum WorkerMonitorId {
    /**
     * 没有实例化成功
     */
    NoWorkerInstance = 'NoWorkerInstance',
    /**
     * 首次通信失败
     */
    FirstCommunicationFail = 'FirstCommunicationFail',
    /**
     * 首次通信超时后成功
     */
    FirstCommunicationTimeoutAndSuccess = 'FirstCommunicationTimeoutAndSuccess',
    /**
     * Worker 线程触发 onerror
     */
    WorkerOnerror = 'WorkerOnerror',
    /**
     * Worker 心跳停止
     */
    HeartBeatStop = 'HeartBeatStop',
    /**
     * Worker 心跳超时
     */
    HeartBeatTimeout = 'HeartBeatTimeout',
    /**
     * 事务处理器逻辑错误
     */
    ActionHandleError = 'ActionHandleError',
}

export enum WorkerErrorSource {
    /**
     * 来源为创建 Worker (new Worker)
     */
    CreateWorkerError = 'CreateWorkerError',
    /**
     * 来源为 Worker.onerrror 监听
     */
    WorkerOnerror = 'WorkerOnerror',
    /**
     * 来源为 Worker 线程主动抛出的错误
     */
    WorkerThreadError = 'WorkerThreadError',
}

/**
 * 监控点上报
 *
 * @param monitorId 监控点
 */
function monitor(monitorId: WorkerMonitorId): void {
    console.log('%cMonitor 上报 id:', 'color: orange', monitorId);
}

function raven(errorSource: WorkerErrorSource, error: Error | ErrorEvent): void {
    /**
     * window.onerror 中也能监控到 worker.onerror( Worker 运行报错)
     * 但是对于加载 js 资源 state 非 2xx, window.onerror 监控不到
     * 如果 window.onerror 已经上报, 这里可以不上报
     */
    if (errorSource === WorkerErrorSource.WorkerOnerror) {
        return;
    }

    console.error('Raven 上报错误:', errorSource, error);
}

function weblog(log: any): void {
    console.log('%cWeblog 上报 log:', 'color: orange', log);
}

export default {
    monitor,
    raven,
    weblog,
};
