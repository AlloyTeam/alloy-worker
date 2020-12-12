/*
 * 项目的上报服务
 */

/**
 * 监控点上报
 *
 * @param monitorId 监控点
 */
function monitor(monitorId: string): void {
    console.error('%cMonitor 上报:', 'color: orange', monitorId);
}

/**
 * 错误上报
 *
 * @param error 报错信息
 */
function raven(error: Error | ErrorEvent): void {
    console.error('Raven 上报错误:', error);
}

/**
 * 业务日志上报
 *
 * @param log
 */
function weblog(log: any): void {
    console.error('%cWeblog 上报:', 'color: orange', log);
}

export default {
    monitor,
    raven,
    weblog,
};
