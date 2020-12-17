import reportProxy from '../external/report-proxy';
import BaseController from '../common/base-controller';
import Channel from '../common/channel';
import { WorkerMonitorId } from '../common/report-type';

/**
 * Worker 线程通信控制器
 */
export default class Controller extends BaseController {
    public constructor() {
        super();

        // 从 Worker url 获取调试模式标志位
        if (location.href.indexOf('debugWorker=true') >= 0) {
            this.isDebugMode = true;
        }

        // Worker 线程中的全局环境 self 就是 Worker 实例
        this.worker = self as any;
        this.channel = new Channel(this.worker, {
            actionHandler: this.actionHandler.bind(this),
            isDebugMode: this.isDebugMode,
        });
    }

    protected reportActionHandlerError(actionType: string, error: any): void {
        console.error(`Worker aciton ${actionType}:`, error);

        // 事务处理器逻辑错误上报
        reportProxy.monitor(WorkerMonitorId.ActionHandleError);

        // Worker 线程中, 如果有堆栈信息, 主动发送到主线程去上报
        if (error?.message && error.stack) {
            // @ts-ignore
            // 调用 worker 线程的 上报事务
            self.alloyWorker.workerReport.captureWorkerException({
                message: error.message,
                stack: error.stack,
            });
        } else {
            // 正常抛出
            throw new Error(error);
        }
    }
}
