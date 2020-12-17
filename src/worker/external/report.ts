/*
 * 项目的上报服务
 *
 * Alloy Worker 及 Worker 线程运行的日志/报错信息都会汇总到上报服务
 * 引入 AlloyWorker 后, 需将上报对接到业务的上报平台
 * 比如在 raven 中调用 raven.js 进行上报
 */

/**
 * 监控点上报
 *
 * @param monitorId 监控点
 */
function monitor(monitorId: string): void {
    // 请在这里调用项目的上报平台
    console.error('%cMonitor Report:', 'color: orange', monitorId);
}

/**
 * 错误上报
 *
 * @param error 报错信息
 */
function raven(error: Error | ErrorEvent): void {
    // 请在这里调用项目的上报平台
    console.error('Raven Report:', error);
}

/**
 * 业务日志上报
 *
 * @param log
 */
function weblog(log: any): void {
    // 请在这里调用项目的上报平台
    console.error('%cWeblog Report:', 'color: orange', log);
}

export default {
    monitor,
    raven,
    weblog,
};
