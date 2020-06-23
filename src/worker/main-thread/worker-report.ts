import BaseAction from '../common/base-action';
import { WorkerReportActionType } from '../common/action-type';
import ReportProxy, { WorkerErrorSource, WorkerMonitorId } from '../report-proxy';

/**
 * Alloy Worker 内部上报的事务
 */
export default class WorkerReport extends BaseAction {
    protected addActionHandler(): void {
        this.controller.addActionHandler(
            WorkerReportActionType.CaptureWorkerException,
            this.captureWorkerException.bind(this)
        );
        this.controller.addActionHandler(WorkerReportActionType.Weblog, this.weblog.bind(this));
        this.controller.addActionHandler(WorkerReportActionType.Monitor, this.monitor.bind(this));
    }

    /**
     * 接收 Worker 线程的报错堆栈并上报
     *
     * @param payload 报错信息
     */
    captureWorkerException(payload: WorkerPayload.WorkerReport.CaptureWorkerException): void {
        const { message, stack } = payload;
        // 防御一下 error 实例修改属性, 一些浏览器内部抛出的错误无法修改 message 字段
        try {
            // 从 worker 中的错误信息和堆栈构建出一个新的错误实例
            const error = Object.assign(new Error(), {
                message,
                stack,
            });

            ReportProxy.raven(WorkerErrorSource.WorkerThreadError, error);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 接收 Worker 线程的 weblog 并上报
     *
     * @param payload 日志信息
     */
    weblog(payload: WorkerPayload.WorkerReport.Weblog): void {
        ReportProxy.weblog(payload);
    }

    /**
     * 接收 Worker 线程的 monitor 并上报
     *
     * @param payload 日志信息
     */
    monitor(payload: WorkerPayload.WorkerReport.Monitor): void {
        ReportProxy.monitor(payload as WorkerMonitorId);
    }
}
