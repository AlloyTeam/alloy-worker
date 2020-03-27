import { HeartBeatCheckInterVal, HeartBeatCheckTimeout } from './common/config';
import MainThreadWorker from './main-thread/index';
import workerReport, { WorkerMonitorId } from './common/worker-report';

/**
 * 对 Worker 线程进行心跳检测
 */
export default class HeartBeatCheck {
    mainThreadWorker: MainThreadWorker;
    /**
     * 是否正在测心跳
     */
    isHeartBeatChecking: boolean = false;
    /**
     * 当前的心跳动次
     */
    heartBeatNow: number = 0;
    /**
     * 不正常的心跳列表
     */
    sickHeartBeats: number[] = [];

    checkInterValHandle: number;
    checkTimeoutHandle: number;

    constructor(mainThreadWorker: MainThreadWorker) {
        this.mainThreadWorker = mainThreadWorker;
    }

    /**
     * 开始心跳检测
     */
    start() {
        // 定时检查
        this.checkInterValHandle = setInterval(() => {
            this.checkOne();
        }, HeartBeatCheckInterVal);
    }

    /**
     * 停止心跳检测
     */
    stop() {
        clearInterval(this.checkInterValHandle);
    }

    /**
     * 检查一次心跳
     */
    checkOne() {
        // 上一次检测未完成, 直接返回
        if (this.isHeartBeatChecking === true) {
            return;
        }
        this.isHeartBeatChecking = true;

        this.heartBeatNow += 1;
        // TODO 移除吗?
        // console.log(`${this.mainThreadWorker.name} heart beat now:`, this.heartBeatNow);
        const heartBeatStartTime = Date.now();
        this.mainThreadWorker.workerAbilityTest.heartBeatTest(this.heartBeatNow).then(() => {
            this.isHeartBeatChecking = false;

            clearTimeout(this.checkTimeoutHandle);

            const heartBeatDuration = Date.now() - heartBeatStartTime;
            this.durationReport(heartBeatDuration);
        });

        this.checkTimeoutHandle = setTimeout(() => {
            this.isHeartBeatChecking = false;
            clearTimeout(this.checkTimeoutHandle);

            this.sickHeartBeats.push(this.heartBeatNow);
            this.checkHealth();
        }, HeartBeatCheckTimeout);
    }

    /**
     * 检查心跳是否健康
     */
    checkHealth() {
        const sickHeartBeatsLength = this.sickHeartBeats.length;
        if (sickHeartBeatsLength >= 2) {
            // 检查规则: 连续2次心跳超时, 认为 Worker 线程死亡
            if (this.sickHeartBeats[sickHeartBeatsLength - 2] + 1 === this.sickHeartBeats[sickHeartBeatsLength - 1]) {
                this.stop();
                this.showDeadTip();
                this.deadReport();
            }
        }
    }

    /**
     * Worker 线程死亡的 UI 提示
     */
    showDeadTip() {
        console.error(`Worker 线程 \`${this.mainThreadWorker.name}\` 已经挂掉了.`);
    }

    /**
     * 心跳时长的上报
     *
     * @param heartBeatDuration 心跳时长
     */
    durationReport(heartBeatDuration: number) {
        // TODO
        // console.log('Heart beat check, duration:', heartBeatDuration);
        // 心跳时长超过心跳检测间隔, 上报
        if (heartBeatDuration > HeartBeatCheckTimeout) {
            // TODO 移除
            // worker 心跳包超时
            workerReport.monitor(WorkerMonitorId.HeartBeatTimeout);
            workerReport.weblog({
                module: 'webworker',
                action: 'worker_heartbeat_duration',
                info: heartBeatDuration,
            });
        }
    }

    /**
     * Worker 线程死亡的上报
     */
    deadReport() {
        // TODO 移除
        //  worker 心跳停止上报
        workerReport.monitor(WorkerMonitorId.HeartBeatStop);
        workerReport.weblog({
            module: 'web_worker',
            action: 'worker_heartbeat_dead',
            // 上报最后一次心跳计数
            info: this.sickHeartBeats[this.sickHeartBeats.length - 1],
        });
    }
}
