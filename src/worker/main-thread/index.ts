/*
 * 主线程的 Worker 业务
 */

import { IAlloyWorkerOptions } from '../type';
import ReportProxy, { WorkerMonitorId } from '../report-proxy';
import HeartBeatCheck from '../heart-beat-check';
import Controller from './controller';
import WorkerAbilityTest from './worker-ability-test';
import WorkerReport from './worker-report';
import Cookie from './cookie';
import Image from './image';

/**
 * 主线程的 Alloy Worker Class
 *
 * @class MainThreadWorker
 */
export default class MainThreadWorker {
    /**
     * Worker 状态上报标识
     */
    static hasReportWorkerStatus = false;
    /**
     * Alloy Worker 名称
     */
    name: string;
    /**
     * 主线程通信控制器
     */
    controller: Controller;
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
    /**
     * 心跳检测
     */
    heartBeatCheck: HeartBeatCheck;
    /**
     * 是否已经终止掉 Worker
     */
    isTerminated = false;

    // 各种业务的实例
    workerAbilityTest: WorkerAbilityTest;
    workerReport: WorkerReport;
    cookie: Cookie;
    image: Image;

    constructor(options: IAlloyWorkerOptions) {
        this.name = options.workerName;
        this.controller = new Controller(options);
        this.heartBeatCheck = new HeartBeatCheck(this);

        // 实例化各种业务
        this.workerAbilityTest = new WorkerAbilityTest(this.controller);
        this.workerReport = new WorkerReport(this.controller);
        this.cookie = new Cookie(this.controller);
        this.image = new Image(this.controller);
    }

    /**
     * 开始进行心跳检测
     */
    startHeartBeatCheck(): void {
        // 心跳检测一般会延迟启动, 可能这时 Worker 已经终止掉了
        // 终止的 Worker 不需要检测
        if (this.isTerminated) {
            return;
        }
        this.heartBeatCheck.start();
    }

    /**
     * 销毁 worker 实例
     */
    terminate(): void {
        this.heartBeatCheck.stop();
        this.controller.terminate();
        // 设置终止标志位
        this.isTerminated = true;
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
     * @param {number} [timeWorkerReplyMessage] 收到 Worker 线程回复的时刻; undefined 则是通信失败, 没有回复
     */
    reportWorkerStatus(isTimeoutAndSuccess = false, timeWorkerReplyMessage?: number): void {
        // 场景: 首次通信已经触发超时上报, 之后才通信成功
        if (isTimeoutAndSuccess) {
            // Worker 首次通信超时后成功上报
            ReportProxy.monitor(WorkerMonitorId.FirstCommunicationTimeoutAndSuccess);
        }

        // 已经上报过不再上报
        if (MainThreadWorker.hasReportWorkerStatus === true) {
            return;
        }
        MainThreadWorker.hasReportWorkerStatus = true;

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
         * 如果无法通信, 则默认为 -1
         */
        let workerReadyDuration = -1;
        if (canPostMessage && timeWorkerReplyMessage) {
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

        ReportProxy.weblog({
            module: 'worker',
            action: 'worker_status',
            info: this.workerStatus,
        });

        if (!canNewWorker) {
            // Worker 没有实例化成功上报
            ReportProxy.monitor(WorkerMonitorId.NoWorkerInstance);
        }
        if (!canPostMessage) {
            // Worker 首次通信失败上报
            ReportProxy.monitor(WorkerMonitorId.FirstCommunicationFail);
        }
    }
}
