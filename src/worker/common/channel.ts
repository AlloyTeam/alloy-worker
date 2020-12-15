import { IController, MessageType, IMessage } from '../type';
import reportProxy from '../external/report-proxy';
import { CommunicationTimeout } from '../config';
import nanoid from './utils/nanoid-no-secure';
import { getDebugTimeStamp } from './utils/index';

/**
 * 通信 Channel
 *
 * @class Channel
 */
export default class Channel {
    /**
     * Web Worker 实例
     */
    private worker: Worker;
    /**
     * 上层通信控制器, 需实现 actionHandler 方法
     */
    private controller: IController;
    /**
     * 会话响应器 Map
     */
    private sessionHandlerMap: {
        [propsName: string]: Function;
    };

    public constructor(worker: Worker, controller: IController) {
        this.worker = worker;
        this.controller = controller;

        this.sessionHandlerMap = {};
        // 绑定 worker onmessage 事件的回调
        this.worker.addEventListener('message', this.onmessage.bind(this));
    }

    /**
     * 发送响应
     *
     * @param sessionId 会话 Id
     * @param payload 负载
     */
    public response(sessionId: string, actionType: string, payload: any): void {
        this.postMessage({
            messageType: MessageType.REPLY,
            actionType,
            payload,
            sessionId,
        });
    }

    /**
     * 发送请求, 不等待响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     */
    public request(actionType: string, payload: any): void {
        const sessionId = this.generateSessionId();
        this.postMessage({
            messageType: MessageType.REQUEST,
            actionType,
            payload,
            sessionId,
        });

        // 不等待结果, 还会收到响应, 添加个空的会话响应器
        this.addSessionHandler(sessionId, () => {});
    }

    /**
     * 发送请求, 并等待响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     * @param timeout 响应超时
     * @returns {Promise<IMessage>}
     */
    public requestPromise<T>(actionType: string, payload: any, timeout = CommunicationTimeout): Promise<T> {
        // 发送请求的时刻
        const timeRequestStart = Date.now();

        const sessionId = this.generateSessionId();
        const message = {
            messageType: MessageType.REQUEST,
            actionType,
            payload,
            sessionId,
        };

        let timeoutHandler: any;

        // 请求封装为一个 Promise, 等待会话响应器进行 resolve
        const PromiseFunction = (resolve: Function): any => {
            const sessionHandler: Function = (message: IMessage) => {
                this.deleteSessionHandler(message.sessionId);
                clearTimeout(timeoutHandler);

                // 请求时长上报
                const requestDuration = Date.now() - timeRequestStart;
                this.requestDurationReport(requestDuration, timeout, actionType);

                resolve(message.payload);
            };

            this.addSessionHandler(sessionId, sessionHandler);

            // 开始发送请求
            this.postMessage(message);
        };

        timeoutHandler = setTimeout(() => {
            clearTimeout(timeoutHandler);

            this.timeoutReport(actionType);
        });

        return new Promise(PromiseFunction);
    }

    /**
     * 收到会话消息的处理函数
     * @description
     * 发现是请求, 调用通信控制器的事务处理器进行处理, 获取事务结果并响应;
     * 发现是响应，调用会话响应器
     * @param event
     */
    private onmessage(event: { data: IMessage }): void {
        const { data: message } = event;
        const { messageType, sessionId, actionType } = message;

        this.onmesssageDebugLog(message);

        // 接收到请求
        if (messageType === MessageType.REQUEST) {
            this.controller.actionHandler(message).then((actionResult) => {
                this.response(sessionId, actionType, actionResult);
            });
        }

        if (messageType === MessageType.REPLY) {
            // 接收到响应
            if (this.hasSessionHandler(sessionId)) {
                this.sessionHandlerMap[sessionId](message);
            } else {
                throw new Error(`没有找到会话 \`${sessionId}\` 的响应器.`);
            }
        }
    }

    /**
     * 封装的 Worker 原生 postMessage 接口
     *
     * @param message 会话消息
     */
    private postMessage(message: IMessage): void {
        const { payload } = message;

        /**
         * 设置为 transfer 传输的 payload 属性, 获取属性 buffer, 组成列表作为 postMessage 的第二个参数.
         * 对不支持 transfer 的浏览器(实测 IE10 不支持, 但 IE11 支持),
         * 需在上层生成 payload 前做判断, 设置 transferProps 为空数组, 退化为数据 clone 的传输方式.
         */
        const transferList: any[] = [];
        if (payload?.transferProps) {
            payload.transferProps.forEach((prop: string) => {
                if (!Object.prototype.hasOwnProperty.call(payload, prop)) {
                    console.error(`Payload without porps ${prop}`);
                    return;
                }

                /**
                 * transfer 支持 ArrayBuffer, MessagePort, ImageBitmap 等数据类型
                 * 但是 IE 和 safari 不支持 ImageBitmap; MessagePort 不常用
                 * IE10 对 ArrayBuffer 也支持
                 * 所以 alloy-worker 只支持 ArrayBuffer 类型
                 */
                // 如果是 ArrayBuffer, push 到 tansfer 数组
                if (payload[prop] instanceof ArrayBuffer) {
                    transferList.push(payload[prop]);
                    return;
                }

                if (!payload[prop].buffer) {
                    console.error(`Payload porps ${prop} without buffer`);
                    return;
                }

                // 取 prop 的 buffer 属性, push 到 transfer 数组
                if (payload[prop].buffer instanceof ArrayBuffer) {
                    transferList.push(payload[prop].buffer);
                }
            });
        }

        this.worker.postMessage(message, transferList);
        this.postMessageDebugLog(message);
    }

    /**
     * 添加会话响应器
     *
     * @private
     * @param sessionId 会话 Id
     * @param handler 会话响应器
     */
    private addSessionHandler(sessionId: string, handler: Function): void {
        if (!this.hasSessionHandler(sessionId)) {
            this.sessionHandlerMap[sessionId] = handler;
        } else {
            throw new Error(`会话 Id \`${sessionId}\` 已经存在, 这不可能!`);
        }
    }

    /**
     * 移除会话响应器
     *
     * @private
     * @param sessionId
     * @memberof Channel
     */
    private deleteSessionHandler(sessionId: string): void {
        if (this.hasSessionHandler(sessionId)) {
            delete this.sessionHandlerMap[sessionId];
        }
    }

    /**
     * 生成每次独立会话的 Id
     *
     * @private
     * @returns 会话 Id
     */
    private generateSessionId(): string {
        // sessionId 长度为 16 位, 有效位数 14 位
        // 以 `w_` 开头, 避免 nanoid 生成时可能以数字开头, 无法作为 Map 的 key
        const sessionId = `w_${nanoid(14)}`;
        return sessionId;
    }

    /**
     * 判断是否有指定会话的处理器
     *
     * @private
     * @param sessionId 会话 Id
     * @returns {boolean}
     */
    private hasSessionHandler(sessionId: string): boolean {
        return !!this.sessionHandlerMap[sessionId];
    }

    /**
     * 请求时长上报
     *
     * @private
     * @param requestDuration 请求时长
     * @param timeout 超时时长
     * @param actionType 事务类型
     */
    private requestDurationReport(requestDuration: number, timeout: number, actionType: string): void {
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
     * worker 通信超时上报
     *
     * @private
     * @param actionType 事务类型
     */
    private timeoutReport(actionType: string) {
        const reportInfo = {
            actionType,
            isInWorker: __WORKER__,
        };

        reportProxy.weblog({
            module: 'webworker',
            action: 'channel_time_out',
            ver5: reportInfo,
        });
    }

    /**
     * 对接收到的会话消息进行 Debug Log 输出
     *
     * @private
     * @param message 接收到的会话消息
     */
    private onmesssageDebugLog(message: IMessage): void {
        // 主线程和 Worker 线程通信是对等的, 只在 Worker 线程中打 log, 就可以了
        if (__WORKER__) {
            // 根据调试标志位展示
            if (this.controller.isDebugMode) {
                /**
                 * ⬇alloyWorker--test, ["00:35.022", "w_2o-bRMLmGwXi5V", "HeartBeatTest", 1]
                 * 线程名称, [时间戳, 会话 Id, 事务类型, 事务负载]
                 * `⬇` 表示 Worker 线程收到的信息
                 */
                console.log(`%c ⬇${self.name}`, 'background: #80FF80; font-size: 15px', [
                    getDebugTimeStamp(),
                    message.sessionId,
                    message.actionType,
                    message.payload,
                ]);
            }
        }
    }

    /**
     * 对发送的会话消息进行 Debug Log 输出
     *
     * @private
     * @param message 发送的会话消息
     */
    private postMessageDebugLog(message: IMessage): void {
        if (__WORKER__) {
            if (this.controller.isDebugMode) {
                /**
                 * ⬆ alloyWorker--test, ["00:35.023", "w_2o-bRMLmGwXi5V", undefined, 1]
                 * 线程名称, [时间戳, 会话 Id, 事务类型, 事务负载]
                 * `⬆` 表示 Worker 线程发出的信息
                 */
                console.log(`%c⬆ ${self.name}`, 'background: #FF8080; font-size: 15px', [
                    getDebugTimeStamp(),
                    message.sessionId,
                    message.actionType,
                    message.payload,
                ]);
            }
        }
    }
}
