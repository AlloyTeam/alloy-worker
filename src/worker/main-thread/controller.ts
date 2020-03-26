import { IAlloyWorkerOptions } from '../type';
import BaseController from '../common/base-controller';
import Channel from '../common/channel';
import workerReport, { WorkerMonitorId, WorkerErrorSource } from '../common/worker-report';

/**
 * 主线程通信控制器
 *
 * @class Controller
 */
export default class Controller extends BaseController {
    /**
     * 浏览器是否实现了 HTML 规范的 Worker Class
     */
    static hasWorkerClass: boolean = !!window.Worker;
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
            // TODO 这里需要加 !__WORKER__ 的判断吗?
            if (!this.canNewWorker) {
                // 都没有 Worker Class, 没法继续了
                return;
            }

            this.timeBeforeNewWorker = Date.now();

            // 主线程通过 new Worker() 获取 Worker 实例
            this.worker = new Worker(options.workerUrl, {
                name: options.workerName,
            });

            // TODO 确认 url state 非 200 window.onerror 能否监控到
            // 监控和上报 worker 中的报错, window.onerror 中也能监控到
            this.worker.onerror = (error) => {
                console.error('worker onerror:', error);
                workerReport.monitor(WorkerMonitorId.WorkerOnerror);
            };

            this.timeAfterNewWorker = Date.now();

            this.channel = new Channel(this.worker, this);
        } catch (error) {
            console.error('init worker fail:', error);

            // 创建 worker 失败, 标识改为不支持
            this.canNewWorker = false;

            // 主动上报错误
            workerReport.raven(WorkerErrorSource.CreateWorkerError, error);
        }
    }

    /**
     * 销毁 worker 实例
     */
    terminate() {
        this.worker.terminate();
    }
}
