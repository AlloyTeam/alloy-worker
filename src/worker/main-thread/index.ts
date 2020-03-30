/*
 * 主线程的 Worker 业务
 */

import { IAlloyWorkerOptions } from '../type';
import Controller from './controller';
import workerReport, { WorkerMonitorId } from '../common/worker-report';
import WorkerAbilityTest from './worker-ability-test';
import Cookie from './cookie';

/**
 * 主线程的 Alloy Worker Class
 *
 * @class MainThreadWorker
 */
export default class MainThreadWorker {
    /**
     * Alloy Worker 名称
     */
    name: string;
    /**
     * 主线程通信控制器
     */
    private controller: Controller;
    /**
     * Worker 状态上报标识
     */
    private hasReportWorkerStatus = false;
    /**
     * Worker 状态信息
     */
    workerStatus: {
        hasWorkerClass: boolean;
        canNewWorker: boolean;
        canPostMessage: boolean;
        workerReadyDuration: number;
        newWorkerDuration: number;
    };

    // 各种业务的实例
    workerAbilityTest: WorkerAbilityTest;
    cookie: Cookie;

    constructor(options: IAlloyWorkerOptions) {
        this.name = options.workerName;
        this.controller = new Controller(options);

        // 实例化各种业务
        this.workerAbilityTest = new WorkerAbilityTest(this.controller);
        this.cookie = new Cookie(this.controller);
    }

    /**
     * 销毁 worker 实例
     */
    terminate(): void {
        this.controller.terminate();
    }

    /**
     * 是否支持 new Worker
     */
    get canNewWorker(): boolean {
        return this.controller.canNewWorker;
    }

    /**
     * Worker 状态上报
     *
     * @param [isTimeoutAndSuccess=false] 是否超时后通信成功
     * @param [timeWorkerReplyMessage=undefined] 收到 Worker 线程回复的时刻; undefined 则是通信失败, 没有回复
     */
    reportWorkerStatus(isTimeoutAndSuccess = false, timeWorkerReplyMessage = undefined): void {
        // 场景: 首次通信已经触发超时上报, 之后才通信成功
        if (isTimeoutAndSuccess) {
            // TODO, 移除
            // 名称：worker首次通信超时后成功
            workerReport.monitor(WorkerMonitorId.FirstCommunicationTimeoutAndSuccess);
        }

        // 已经上报过不再上报
        if (this.hasReportWorkerStatus === true) {
            return;
        }
        this.hasReportWorkerStatus = true;

        // TODO 注释对齐
        /**
         * 是否有 Worker Class
         */
        const hasWorkerClass = Controller.hasWorkerClass;
        /**
         * 创建 Worker 实例是否成功
         */
        const canNewWorker = this.controller.canNewWorker;
        /**
         * Worker 实例有无通讯能力, 或 Worker 脚本加载失败
         */
        const canPostMessage = !!timeWorkerReplyMessage;
        /**
         * 第一条信息从发出到收到的时间间隔
         * 如果无法通信, 则默认为 NaN
         */
        let workerReadyDuration = NaN;
        if (canPostMessage) {
            workerReadyDuration = timeWorkerReplyMessage - this.controller.timeBeforeNewWorker;
        }
        /**
         * 主线程创建 Worker 的同步耗时, 正常为 1ms 就完成了
         */
        let newWorkerDuration = NaN;
        if (this.controller.timeAfterNewWorker && this.controller.timeBeforeNewWorker) {
            newWorkerDuration = this.controller.timeAfterNewWorker - this.controller.timeBeforeNewWorker;
        }

        this.workerStatus = {
            hasWorkerClass,
            canNewWorker,
            canPostMessage,
            workerReadyDuration,
            newWorkerDuration,
        };

        workerReport.weblog({
            module: 'worker',
            action: 'worker_status',
            info: this.workerStatus,
        });

        if (!canNewWorker) {
            // TODO 移除
            // 名称：worker没有实例化成功
            workerReport.monitor(WorkerMonitorId.NoWorkerInstance);
        }
        if (!canPostMessage) {
            // TODO 移除
            // 名称：worker首次通信失败
            workerReport.monitor(WorkerMonitorId.FirstCommunicationFail);
        }
    }
}
