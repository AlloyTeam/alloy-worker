import { IAlloyWorkerOptions } from '../type';
import BaseController from '../common/base-controller';
import Channel from '../common/channel';
import ReportProxy, { WorkerMonitorId, WorkerErrorSource } from '../report-proxy';

/**
 * 主线程通信控制器
 *
 * @class Controller
 */
export default class Controller extends BaseController {
    /**
     * 浏览器是否实现了 HTML 规范的 Worker Class
     */
    static hasWorkerClass = !!window.Worker;
    /**
     * 是否支持 new Worker, 默认为 Wroker Class 是否实现
     */
    canNewWorker: boolean = Controller.hasWorkerClass;
    /**
     * 主线程 new Worker 起始时刻
     */
    timeBeforeNewWorker: number;
    /**
     * 主线程 new Worker 完毕时刻
     */
    timeAfterNewWorker: number;

    constructor(options: IAlloyWorkerOptions) {
        super();

        try {
            if (!this.canNewWorker) {
                // 都没有 Worker Class, 没法继续了
                return;
            }

            this.timeBeforeNewWorker = Date.now();

            let workerUrl = options.workerUrl;
            if (options.isDebugMode) {
                this.isDebugMode = true;

                // 通过 Worker url 传递调试参数到 Worker 线程中
                const debugModeSearch = `debugWorker=true`;
                workerUrl =
                    workerUrl.indexOf('?') > 0 ? `${workerUrl}&${debugModeSearch}` : `${workerUrl}?${debugModeSearch}`;
            }

            // 主线程通过 new Worker() 获取 Worker 实例
            this.worker = new Worker(workerUrl, {
                name: options.workerName,
            });

            /**
             * 监控和上报 worker 中的报错
             * window.onerror 中也能监控到 worker.onerror( Worker 运行报错)
             * 但是对于加载 js 资源 state 非 2xx, window.onerror 监控不到
             */
            this.worker.onerror = (error): void => {
                console.error('Worker onerror:', error);

                // 主动上报错误
                ReportProxy.raven(WorkerErrorSource.WorkerOnerror, error);
                ReportProxy.monitor(WorkerMonitorId.WorkerOnerror);
            };

            this.timeAfterNewWorker = Date.now();

            this.channel = new Channel(this.worker, this);
        } catch (error) {
            console.error('Init worker fail:', error);

            // 创建 worker 失败, 标识改为不支持
            this.canNewWorker = false;

            // 主动上报错误
            ReportProxy.raven(WorkerErrorSource.CreateWorkerError, error);
        }
    }

    /**
     * 销毁 worker 实例
     */
    terminate(): void {
        this.worker.terminate();
    }

    weblog(log: any): void {
        ReportProxy.weblog(log);
    }

    protected reportActionHandlerError(error: any): void {
        console.error('Worker aciton error:', error);

        // 事务处理器逻辑错误上报
        ReportProxy.monitor(WorkerMonitorId.ActionHandleError);

        // 主线程的报错, 在 window.onerror 中可以拿到报错堆栈, 直接抛出即可
        throw new Error(error);
    }
}
