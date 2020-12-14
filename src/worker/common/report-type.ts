/*
 * Worker 可用性上报的字段
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

export const enum WorkerErrorSource {
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
