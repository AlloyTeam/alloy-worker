import BaseAction from '../common/base-action';
import { RavenActionType } from '../common/action-type';
import Controller from './controller';

/**
 * 渡鸦上报的事务
 */
export default class Raven extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {}

    /**
     * 将 Worker 线程的报错堆栈发到主线程进行上报
     *
     * @param payload 报错信息
     */
    captureWorkerException(payload: WorkerPayload.Raven.CaptureWorkerException): void {
        return this.controller.request(RavenActionType.CaptureWorkerException, payload);
    }
}
