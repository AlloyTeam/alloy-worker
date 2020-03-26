/*
 * Worker 可用性上报
 */

export enum WorkerMonitorId {
    /**
     * 没有实例化成功
     */
    NoWorkerInstance = 1,
    /**
     * 首次通信失败
     */
    FirstCommunicationFail,
    /**
     * 首次通信超时后成功
     */
    FirstCommunicationTimeoutAndSuccess,
    /**
     * Worker 线程触发 onerror
     */
    WorkerOnerror,
    /**
     * Worker 心跳停止
     */
    HeartBeatStop,
    /**
     * Worker 心跳超时
     */
    HeartBeatTimeout,
    /**
     * 事务处理器逻辑报错
     */
    ActionHandleError,
};

export enum WorkerErrorSource {
    CreateWorkerError = 'CreateWorkerError',
}

/**
 * 监控点上报
 *
 * @param monitorId 监控点
 */
function monitor(monitorId: WorkerMonitorId) {
    console.log('monitor 上报, id: ', monitorId);
}

function raven(errorSource: WorkerErrorSource, error: Error) {
    console.log('raven 上报, 报错信息:', errorSource, error);
}

function weblog(log: any) {

}

export default {
    monitor,
    raven,
    weblog,
}
