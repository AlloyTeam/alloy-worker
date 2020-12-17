import type { IAlloyWorkerOptions } from '../type';
import reportProxy from '../external/report-proxy';
import { WorkerMonitorId, WorkerErrorSource } from '../common/report-type';
import BaseController from '../common/base-controller';
import Channel from '../common/channel';

/**
 * 主线程通信控制器
 */
export default class Controller extends BaseController {
    /**
     * 浏览器是否实现了 HTML 规范的 Worker Class
     */
    public static hasWorkerClass = !!window.Worker;
    /**
     * 是否支持 new Worker, 默认为 Wroker Class 是否实现
     */
    public canNewWorker: boolean = Controller.hasWorkerClass;
    /**
     * 主线程 new Worker 起始时刻
     */
    public timeBeforeNewWorker: number;
    /**
     * 主线程 new Worker 完毕时刻
     */
    public timeAfterNewWorker: number;

    public constructor(options: IAlloyWorkerOptions) {
        super();

        this.isDebugMode = options.isDebugMode || false;

        if (!this.canNewWorker) {
            // 都没有 Worker Class, 没法继续了
            return;
        }

        this.newWorker(options);
    }

    /**
     * 销毁 Worker 线程实例
     */
    public terminate(): void {
        this.worker?.terminate();
    }

    protected reportActionHandlerError(actionType: string, error: any): void {
        console.error(`Worker aciton ${actionType}:`, error);

        // 事务处理器逻辑错误上报
        reportProxy.monitor(WorkerMonitorId.ActionHandleError);

        // 主线程的报错, 在 window.onerror 中可以拿到报错堆栈, 直接抛出即可
        throw new Error(error);
    }

    /**
     * 创建 Worker 线程实例
     */
    private newWorker(options: IAlloyWorkerOptions) {
        this.timeBeforeNewWorker = Date.now();

        try {
            // 主线程通过 new Worker() 获取 Worker 实例
            this.worker = new Worker(options.workerUrl, {
                name: options.workerName,
            });

            /**
             * 监控和上报 worker 中的报错
             * window.onerror 中也能监控到 worker.onerror( Worker 运行报错)
             * 但是对于加载 js 资源 state 非 2xx, window.onerror 监控不到
             */
            this.worker.onerror = (error): void => {
                console.error('Worker onerror:', error);

                // 主动上报错误和 monitor
                reportProxy.raven(error);
                reportProxy.monitor(WorkerErrorSource.WorkerOnerror);
                reportProxy.monitor(WorkerMonitorId.WorkerOnerror);
            };

            this.timeAfterNewWorker = Date.now();

            // 实例化 Channel
            this.channel = new Channel(this.worker, {
                actionHandler: this.actionHandler.bind(this),
                isDebugMode: this.isDebugMode,
            });
        } catch (error) {
            console.error('Init worker fail:', error);

            // 创建 worker 失败, 标识改为不支持
            this.canNewWorker = false;

            // 主动上报错误和 monitor
            reportProxy.raven(error);
            reportProxy.monitor(WorkerErrorSource.CreateWorkerError);
        }
    }
}
