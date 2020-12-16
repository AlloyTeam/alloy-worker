import reportProxy from './external/report-proxy';
import { CommunicationTimeout } from './config';
import { WorkerMonitorId } from './common/report-type';
import MainThreadWorker from './main-thread/index';
import Controller from './main-thread/controller';

export default class WorkerStatusCheck {
    /**
     * Worker 状态上报标识
     * 定义为类属性, 在多个 Worker 的场景下, 也只上报一次
     * 因为多次 new Worker 时, 状态信息差别不大
     * url 资源会缓存, 后续加载的等待时间会变短
     */
    public static hasReportWorkerStatus = false;
    /**
     * 主线程的 Alloy Worker
     */
    private mainThreadWorker: MainThreadWorker;
    /**
     * 主线程 new Worker 起始时刻
     */
    private timeBeforeNewWorker: number;
    /**
     * 主线程 new Worker 完毕时刻
     */
    private timeAfterNewWorker: number;
    /**
     * 是否支持 new Worker
     */
    private canNewWorker: boolean;
    /**
     * 是否调试模式
     */
    private isDebugMode: boolean;
    /**
     * Worker 状态信息
     */
    private workerStatus: {
        hasWorkerClass: boolean;
        canNewWorker: boolean;
        canPostMessage: boolean;
        workerReadyDuration: number;
        newWorkerDuration: number;
    };

    public constructor(controller: Controller, mainThreadWorker: MainThreadWorker) {
        this.mainThreadWorker = mainThreadWorker;

        this.timeBeforeNewWorker = controller.timeBeforeNewWorker;
        this.timeAfterNewWorker = controller.timeAfterNewWorker;
        this.canNewWorker = controller.canNewWorker;
        this.isDebugMode = controller.isDebugMode;
    }

    /**
     * 进行 worker 通信能力测试
     */
    public check() {
        // 等待通信超时后上报
        // 为了可用性, 通信超时后并不会结束等待, 而是打点上报
        // 正常不会走到事务的 .catch 逻辑, 所以需要独立设置超时上报
        const firstCommunicationTimeoutHandle = setTimeout(() => {
            this.report();
        }, CommunicationTimeout);

        // 默认 worker 才进行 worker 能力上报
        // 上报 worker 信息
        this.mainThreadWorker.workerAbilityTest
            .communicationTest()
            .then((workerGetMessageDuration: number) => {
                const timeWorkerReplyMessage = Date.now();
                clearTimeout(firstCommunicationTimeoutHandle);

                if (this.isDebugMode) {
                    console.log(`%cFirst comunication duration: ${workerGetMessageDuration}ms`, 'color: orange');
                }

                const isTimeout = workerGetMessageDuration > CommunicationTimeout;
                this.report(isTimeout, timeWorkerReplyMessage);
            })
            .catch((error) => {
                if (this.isDebugMode) {
                    // 首次通信 timeout 错误
                    console.error(`%cFirst communication timeout: ${error}`, 'color: orange');
                }
            });
    }

    /**
     * Worker 状态上报
     *
     * @param [isTimeoutAndSuccess=false] 是否超时后通信成功
     * @param [timeWorkerReplyMessage] 收到 Worker 线程回复的时刻; undefined 则是通信失败, 没有回复
     */
    public report(isTimeoutAndSuccess = false, timeWorkerReplyMessage?: number): void {
        // 场景: 首次通信已经触发超时上报, 之后才通信成功
        if (isTimeoutAndSuccess) {
            // Worker 首次通信超时后成功上报
            reportProxy.monitor(WorkerMonitorId.FirstCommunicationTimeoutAndSuccess);
        }

        // 已经上报过不再上报
        if (WorkerStatusCheck.hasReportWorkerStatus === true) {
            return;
        }
        WorkerStatusCheck.hasReportWorkerStatus = true;

        /**
         * 是否有 Worker Class
         */
        const hasWorkerClass = Controller.hasWorkerClass;
        /**
         * Worker 实例有无通讯能力, 或 Worker 脚本加载失败
         */
        const canPostMessage = !!timeWorkerReplyMessage;
        /**
         * 第一条信息从发出到收到的时间间隔
         * 如果无法通信, 则默认为 -1
         */
        let workerReadyDuration = -1;
        if (canPostMessage && timeWorkerReplyMessage) {
            workerReadyDuration = timeWorkerReplyMessage - this.timeBeforeNewWorker;
        }
        /**
         * 主线程创建 Worker 的同步耗时, 正常为 1ms 就完成了
         */
        let newWorkerDuration = NaN;
        if (this.timeAfterNewWorker && this.timeBeforeNewWorker) {
            newWorkerDuration = this.timeAfterNewWorker - this.timeBeforeNewWorker;
        }

        this.workerStatus = {
            hasWorkerClass,
            canNewWorker: this.canNewWorker,
            canPostMessage,
            workerReadyDuration,
            newWorkerDuration,
        };

        reportProxy.weblog({
            module: 'worker',
            action: 'worker_status',
            info: this.workerStatus,
        });

        if (!this.canNewWorker) {
            // Worker 没有实例化成功上报
            reportProxy.monitor(WorkerMonitorId.NoWorkerInstance);
        }
        if (!canPostMessage) {
            // Worker 首次通信失败上报
            reportProxy.monitor(WorkerMonitorId.FirstCommunicationFail);
        }
    }
}
