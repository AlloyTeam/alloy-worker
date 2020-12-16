import reportProxy from '../external/report-proxy';
import { WorkerPayload } from '../common/payload-type';
import { WorkerErrorSource, WorkerMonitorId } from '../common/report-type';
import BaseAction from '../common/base-action';
import { WorkerReportActionType } from '../common/action-type';

/**
 * Alloy Worker 内部上报的事务
 */
export default class WorkerReport extends BaseAction {
    protected addActionHandler(): void {
        this.controller.addActionHandler(
            WorkerReportActionType.CaptureWorkerException,
            this.captureWorkerException.bind(this)
        );

        this.controller.addActionHandler(WorkerReportActionType.Monitor, this.monitor.bind(this));
        this.controller.addActionHandler(WorkerReportActionType.Raven, this.raven.bind(this));
        this.controller.addActionHandler(WorkerReportActionType.Weblog, this.weblog.bind(this));
    }

    /**
     * 接收 Worker 线程的报错堆栈并上报
     *
     * @param payload 报错信息
     */
    private captureWorkerException(payload: WorkerPayload.WorkerReport.CaptureWorkerException): void {
        const { message, stack } = payload;
        // 防御一下 error 实例修改属性, 一些浏览器内部抛出的错误无法修改 message 字段
        try {
            // 从 worker 中的错误信息和堆栈构建出一个新的错误实例
            const error = Object.assign(new Error(), {
                message,
                stack,
            });

            reportProxy.raven(error);
        } catch (error) {
            console.error(error);
        }

        // 上报一个 worker 线程报错的 monitor 点
        reportProxy.monitor(WorkerErrorSource.WorkerThreadError);
    }

    /**
     * 接收 Worker 线程的 monitor 并上报
     *
     * @param payload 日志信息
     */
    private monitor(payload: WorkerPayload.WorkerReport.Monitor): void {
        reportProxy.monitor(payload as WorkerMonitorId);
    }

    /**
     * 接收 Worker 线程的 raven 并上报
     *
     * @param payload 日志信息
     */
    private raven(payload: WorkerPayload.WorkerReport.Raven): void {
        reportProxy.raven(payload);
    }

    /**
     * 接收 Worker 线程的 weblog 并上报
     *
     * @param payload 日志信息
     */
    private weblog(payload: WorkerPayload.WorkerReport.Weblog): void {
        reportProxy.weblog(payload);
    }
}
