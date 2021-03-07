import reportProxy from '../external/report-proxy';
import { IMessage } from '../type';
import { getDebugTimeStamp } from './utils';

export default class ChannelReport {
    /**
     * 是否调试模式
     */
    private isDebugMode: boolean;

    public constructor(isDebugMode: boolean) {
        this.isDebugMode = isDebugMode;
    }

    /**
     * Worker 通信超时上报
     *
     * @param actionType 事务类型
     */
    public timeoutReport(reportInfo: { actionType: string; isInWorker: boolean }): void {
        reportProxy.weblog({
            module: 'webworker',
            action: 'channel_time_out',
            ver5: reportInfo,
        });
    }

    /*
     * 请求时长上报
     *
     * @param requestDuration 请求时长
     * @param timeout 超时时长
     * @param actionType 事务类型
     */
    public requestDurationReport(requestDuration: number, timeout: number, actionType: string): void {
        if (requestDuration > timeout) {
            const requestDurationInfo = {
                actionType,
                duration: requestDuration,
                inWorker: __WORKER__,
            };

            reportProxy.weblog({
                module: 'worker',
                action: 'channel_long_time',
                info: requestDurationInfo,
            });
        }
    }

    /**
     * 对接收到的会话消息进行 Debug Log 输出
     *
     * @param message 接收到的会话消息
     */
    public onmesssageDebugLog(message: IMessage): void {
        // 主线程和 worker 线程通信是对等的, 只需在 worker 线程中打 log, 避免主线程打日志耗时
        if (!__WORKER__) {
            return;
        }
        // 根据调试标志位展示
        if (!this.isDebugMode) {
            return;
        }

        /**
         * ⬇alloyWorker--test, ["00:35.022", "w_2o-bRMLmGwXi5V", "HeartBeatTest", 1]
         * 线程名称, [时间戳, 会话 Id, 事务类型, 事务负载]
         * `⬇` 表示 worker 线程收到的信息
         */
        console.log(`%c ⬇${self.name}`, 'background: #80FF80; font-size: 15px', [
            getDebugTimeStamp(),
            message.sessionId,
            message.actionType,
            message.payload,
        ]);
    }

    /**
     * 对发送的会话消息进行 Debug Log 输出
     *
     * @param message 发送的会话消息
     */
    public postMessageDebugLog(message: IMessage): void {
        if (!__WORKER__) {
            return;
        }
        // 根据调试标志位展示
        if (!this.isDebugMode) {
            return;
        }

        /**
         * ⬆ alloyWorker--test, ["00:35.023", "w_2o-bRMLmGwXi5V", undefined, 1]
         * 线程名称, [时间戳, 会话 Id, 事务类型, 事务负载]
         * `⬆` 表示 worker 线程发出的信息
         */
        console.log(`%c⬆ ${self.name}`, 'background: #FF8080; font-size: 15px', [
            getDebugTimeStamp(),
            message.sessionId,
            message.actionType,
            message.payload,
        ]);
    }
}
