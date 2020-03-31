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

    protected addActionHandler(): void {
        this.controller.addActionHandler(
            RavenActionType.CaptureWorkerException,
            this.captureWorkerExceptionHandler.bind(this)
        );
    }

    captureWorkerExceptionHandler(payload: WorkerPayload.Raven.CaptureWorkerException): void {
        const { message, stack } = payload;
        // 防御一下 error 实例修改属性, 一些浏览器内部抛出的错误无法修改 message 字段
        try {
            // 从 worker 中的错误信息和堆栈构建出一个新的错误实例
            const error = Object.assign(new Error(), {
                message,
                stack,
            });

            // TODO 调用上报
            console.error(error);
        } catch (error) {
            console.error(error);
        }
    }
}
