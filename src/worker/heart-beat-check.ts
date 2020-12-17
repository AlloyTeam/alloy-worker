import reportProxy from './external/report-proxy';
import { WorkerMonitorId } from './common/report-type';
import { HeartBeatCheckInterVal, HeartBeatCheckTimeout } from './config';
import MainThreadWorker from './main-thread/index';

/**
 * 对 Worker 线程进行心跳检测
 */
export default class HeartBeatCheck {
    private mainThreadWorker: MainThreadWorker;
    /**
     * 是否正在测心跳
     */
    private isHeartBeatChecking = false;
    /**
     * 当前的心跳动次
     */
    private heartBeatNow = 0;
    /**
     * 不正常的心跳列表
     */
    private sickHeartBeats: number[] = [];
    /**
     * 移除 onmessage 监听的函数
     */
    private removeOnmessageListener: null | (() => void);

    private checkInterValHandle: number;
    private checkTimeoutHandle: number;

    public constructor(mainThreadWorker: MainThreadWorker) {
        this.mainThreadWorker = mainThreadWorker;
    }

    /**
     * 开始心跳检测
     */
    public start(): void {
        // 定时检查
        this.checkInterValHandle = window.setInterval(() => {
            this.checkHeartBeat();
        }, HeartBeatCheckInterVal);

        this.removeOnmessageListener = this.mainThreadWorker.controller.addOnmessageListener(
            this.onmessageAsHealthHeartBeat.bind(this)
        );
    }

    /**
     * 停止心跳检测
     */
    public stop(): void {
        clearInterval(this.checkInterValHandle);
        clearTimeout(this.checkTimeoutHandle);

        this.removeOnmessageListener?.();
        this.removeOnmessageListener = null;
    }

    /**
     * 检查一次心跳
     */
    private checkHeartBeat(): void {
        // 上一次检测未完成, 直接返回
        if (this.isHeartBeatChecking) {
            return;
        }
        this.isHeartBeatChecking = true;

        this.heartBeatNow += 1;

        const heartBeatStartTime = Date.now();
        this.mainThreadWorker.workerAbilityTest.heartBeatTest(this.heartBeatNow).then(() => {
            this.isHeartBeatChecking = false;

            clearTimeout(this.checkTimeoutHandle);

            const heartBeatDuration = Date.now() - heartBeatStartTime;
            this.durationReport(heartBeatDuration);
        });

        clearTimeout(this.checkTimeoutHandle);
        this.checkTimeoutHandle = window.setTimeout(() => {
            this.isHeartBeatChecking = false;
            clearTimeout(this.checkTimeoutHandle);

            this.sickHeartBeats.push(this.heartBeatNow);
            this.checkHealth();
        }, HeartBeatCheckTimeout);
    }

    /**
     * 监听 worker 的 onmessage, 作为正常返回的心跳
     */
    private onmessageAsHealthHeartBeat() {
        // 不是检查中, 直接返回
        if (!this.isHeartBeatChecking) {
            return;
        }

        this.isHeartBeatChecking = false;
        clearTimeout(this.checkTimeoutHandle);
    }

    /**
     * 检查心跳是否健康
     */
    private checkHealth(): void {
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
    private showDeadTip(): void {
        console.error(`%cWorker thread \`${this.mainThreadWorker.name}\` dead`, 'color: orange');
    }

    /**
     * 心跳时长的上报
     *
     * @param heartBeatDuration 心跳时长
     */
    private durationReport(heartBeatDuration: number): void {
        // 心跳时长超过心跳检测间隔, 上报
        if (heartBeatDuration > HeartBeatCheckTimeout) {
            // Worker 心跳包超时上报
            reportProxy.monitor(WorkerMonitorId.HeartBeatTimeout);
            reportProxy.weblog({
                module: 'worker',
                action: 'worker_heartbeat_duration',
                info: heartBeatDuration,
            });
        }
    }

    /**
     * Worker 线程死亡的上报
     */
    private deadReport(): void {
        // Worker 心跳停止上报
        reportProxy.monitor(WorkerMonitorId.HeartBeatStop);
        reportProxy.weblog({
            module: 'worker',
            action: 'worker_heartbeat_dead',
            // 上报最后一次心跳计数
            info: this.sickHeartBeats[this.sickHeartBeats.length - 1],
        });
    }
}
