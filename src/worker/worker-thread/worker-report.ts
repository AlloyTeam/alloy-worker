import type Controller from './controller';
import reportProxy, { ReportProxy } from '../external/report-proxy';
import BaseAction from '../common/base-action';
import { WorkerPayload } from '../common/payload-type';
import { WorkerReportActionType } from '../common/action-type';

/**
 * Alloy Worker 内部上报的事务
 */
export default class WorkerReport extends BaseAction {
    /**
     * 将 reportProxy 替换为真实的上报实例, 上报实例的各种方法调用为发送数据到主线程上报.
     */
    public static loadRealReport(report: WorkerReport) {
        ReportProxy.eachLoad({
            monitor: report.monitor.bind(report),
            raven: report.raven.bind(report),
            weblog: report.weblog.bind(report),
        });
    }

    public constructor(controller: Controller, threadAction: any) {
        super(controller, threadAction);

        // @ts-ignore
        // reportProxy 挂到全局
        self.reportProxy = reportProxy;

        WorkerReport.loadRealReport(this);
    }

    /**
     * 将 Worker 线程的报错堆栈发到主线程进行上报
     *
     * @param payload 报错信息
     */
    public captureWorkerException(payload: WorkerPayload.WorkerReport.CaptureWorkerException): void {
        return this.controller.request(WorkerReportActionType.CaptureWorkerException, payload);
    }

    /**
     * 将 Worker 线程的 monitor 发到主线程进行上报
     *
     * @param payload monitor 信息
     */
    public monitor(payload: WorkerPayload.WorkerReport.Monitor): void {
        return this.controller.request(WorkerReportActionType.Monitor, payload);
    }

    /**
     * 将 Worker 线程的 raven 发到主线程进行上报
     *
     * @param payload raven 信息
     */
    public raven(payload: WorkerPayload.WorkerReport.Raven): void {
        return this.controller.request(WorkerReportActionType.Raven, payload);
    }

    /**
     * 将 Worker 线程的 weblog 发到主线程进行上报
     *
     * @param payload 日志信息
     */
    public weblog(payload: WorkerPayload.WorkerReport.Weblog): void {
        return this.controller.request(WorkerReportActionType.Weblog, payload);
    }

    protected addActionHandler(): void {}
}
