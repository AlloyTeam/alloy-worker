/*
 * 主线程的 Worker 业务
 */

import type { IAlloyWorkerOptions } from '../type';
import { HeartBeatCheckStartDelay } from '../config';
import HeartBeatCheck from '../heart-beat-check';
import WorkerStatusCheck from '../worker-status-check';
import Controller from './controller';
import WorkerAbilityTest from './worker-ability-test';
import WorkerReport from './worker-report';
import Cookie from './cookie';
// AlloyWorkerAutoInsert: import <%=AlloyWorkerPureActionName%> from './<%=AlloyWorkerActionName%>';

// 只声明事务命名空间, 用于事务中调用其他命名空间的事务
export interface IMainThreadAction {
    workerAbilityTest: WorkerAbilityTest;
    workerReport: WorkerReport;
    cookie: Cookie;
    // AlloyWorkerAutoInsert: <%=AlloyWorkerPureActionNameLowerCase%>: <%=AlloyWorkerPureActionName%>;
}

/**
 * 主线程的 Alloy Worker Class
 *
 * @class MainThreadWorker
 */
export default class MainThreadWorker implements IMainThreadAction {
    /**
     * Alloy Worker 名称
     */
    public name: string;
    /**
     * 主线程通信控制器
     */
    public controller: Controller;

    // 各种业务的实例
    public workerAbilityTest: WorkerAbilityTest;
    public workerReport: WorkerReport;
    public cookie: Cookie;
    // AlloyWorkerAutoInsert: public <%=AlloyWorkerPureActionNameLowerCase%>: <%=AlloyWorkerPureActionName%>;

    /**
     * Worker 心跳检查
     */
    private heartBeatCheck: HeartBeatCheck;
    /**
     * Worker 状态检查
     */
    private workerStatusCheck: WorkerStatusCheck;
    /**
     * 是否已经终止掉 Worker
     */
    private isTerminated = false;

    public constructor(options: IAlloyWorkerOptions) {
        this.name = options.workerName;
        this.controller = new Controller(options);
        this.heartBeatCheck = new HeartBeatCheck(this);
        this.workerStatusCheck = new WorkerStatusCheck(this.controller, this);

        // 实例化各种业务
        this.workerAbilityTest = new WorkerAbilityTest(this.controller, this);
        this.workerReport = new WorkerReport(this.controller, this);
        this.cookie = new Cookie(this.controller, this);
        // AlloyWorkerAutoInsert: this.<%=AlloyWorkerPureActionNameLowerCase%> = new <%=AlloyWorkerPureActionName%>(this.controller, this);
    }

    /**
     * 开始进行状态检查
     */
    public startWorkerStatusCheck() {
        // 无法实例化 Worker, 不能再去检测 Worker 能力了, 会报错
        if (!this.controller.canNewWorker) {
            // 直接上报当前状态
            this.workerStatusCheck.report();
            return;
        }

        // 检查 Worker 状态
        this.workerStatusCheck.check();

        // 心跳检测, 延迟启动
        // 避免打开页面时主线程的同步逻辑阻塞 Worker js 加载; 也等待 Worker 线程启动完
        setTimeout(() => {
            this.startHeartBeatCheck();
        }, HeartBeatCheckStartDelay);
    }

    /**
     * 销毁 worker 实例
     */
    public terminate(): void {
        this.heartBeatCheck.stop();
        this.controller.terminate();
        // 设置终止标志位
        this.isTerminated = true;
    }

    /**
     * 开始进行心跳检查
     */
    private startHeartBeatCheck(): void {
        // 心跳检测一般会延迟启动, 可能这时 Worker 已经终止掉了
        // 终止的 Worker 不需要检测
        if (this.isTerminated) {
            return;
        }
        this.heartBeatCheck.start();
    }
}
