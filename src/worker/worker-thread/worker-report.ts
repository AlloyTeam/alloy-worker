import type { IWorkerThreadAction } from './index';
import BaseAction from '../common/base-action';
import { WorkerReportActionType } from '../common/action-type';

/**
 * Alloy Worker 内部上报的事务
 */
export default class WorkerReport extends BaseAction {
    protected threadAction: IWorkerThreadAction;

    /**
     * 将 Worker 线程的报错堆栈发到主线程进行上报
     *
     * @param payload 报错信息
     */
    public captureWorkerException(payload: WorkerPayload.WorkerReport.CaptureWorkerException): void {
        return this.controller.request(WorkerReportActionType.CaptureWorkerException, payload);
    }

    /**
     * 将 Worker 线程的 weblog 发到主线程进行上报
     *
     * @param payload 日志信息
     */
    public weblog(payload: WorkerPayload.WorkerReport.Weblog): void {
        return this.controller.request(WorkerReportActionType.Weblog, payload);
    }

    /**
     * 将 Worker 线程的 monitor 发到主线程进行上报
     *
     * @param payload monitor 信息
     */
    public monitor(payload: WorkerPayload.WorkerReport.Monitor): void {
        return this.controller.request(WorkerReportActionType.Monitor, payload);
    }

    protected addActionHandler(): void {}
}
