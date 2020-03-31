import { IController, MessageType, IMessage } from '../type';
import { CommunicationTimeout } from '../config';
import ReportProxy from '../report-proxy';
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

    constructor(worker: Worker, controller: IController) {
        this.worker = worker;
        this.controller = controller;

        this.sessionHandlerMap = {};
        // 绑定 worker onmessage 事件的回调
        this.worker.onmessage = this.onmessage.bind(this);
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
        const { messageType, sessionId } = message;

        this.onmesssageDebugLog(message);

        // 接收到请求
        if (messageType === MessageType.REQUEST) {
            this.controller.actionHandler(message).then((actionResult) => {
                this.response(sessionId, actionResult);
            });
        } else if (messageType === MessageType.REPLY) {
            // 接收到响应
            if (this.hasSessionHandler(sessionId)) {
                this.sessionHandlerMap[sessionId](message);
            } else {
                throw new Error(`没有找到会话 \`${sessionId}\` 的响应器.`);
            }
        }
    }

    /**
     * 发送响应
     *
     * @param sessionId 会话 Id
     * @param payload 负载
     */
    response(sessionId: string, payload: any): void {
        this.postMessage({
            messageType: MessageType.REPLY,
            actionType: undefined,
            payload,
            sessionId,
        });
    }

    /**
     * 封装的 Worker 原生 postMessage 接口
     *
     * @param message 会话消息
     */
    private postMessage(message: IMessage): void {
        this.worker.postMessage(message);
        this.postMessageDebugLog(message);
    }

    /**
     * 发送请求, 不等待响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     */
    request(actionType: string, payload: any): void {
        const sessionId = this.generateSessionId();
        this.postMessage({
            messageType: MessageType.REQUEST,
            actionType,
            payload,
            sessionId,
        });

        // 不等待结果, 还会收到响应, 添加个空的会话响应器
        this.addSessionListener(sessionId, () => {});
    }

    /**
     * 发送请求, 并等待响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     * @param timeout 响应超时
     * @returns {Promise<IMessage>}
     */
    requestPromise(actionType: string, payload: any, timeout = CommunicationTimeout): Promise<any> {
        // 发送请求的时刻
        const timeRequestStart = Date.now();

        const sessionId = this.generateSessionId();
        const message = {
            messageType: MessageType.REQUEST,
            actionType,
            payload,
            sessionId,
        };

        // 请求封装为一个 Promise, 等待会话响应器进行 resolve
        const PromiseFunction = (resolve: Function): any => {
            const sessionHandler: Function = (message: IMessage) => {
                this.deleteSessionListener(message.sessionId);

                // 请求时长上报
                const requestDuration = Date.now() - timeRequestStart;
                this.requestDurationReport(requestDuration, timeout, actionType);

                resolve(message.payload);
            };

            this.addSessionListener(sessionId, sessionHandler);

            // 开始发送请求
            this.postMessage(message);
        };

        return new Promise(PromiseFunction);
    }

    /**
     * 添加会话响应器
     *
     * @private
     * @param sessionId 会话 Id
     * @param handler 会话响应器
     */
    private addSessionListener(sessionId: string, handler: Function): void {
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
    private deleteSessionListener(sessionId: string): void {
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
     * @param postMessageDuration 请求时长
     * @param number} timeout 超时时长
     * @param actionType 事务类型
     */
    private requestDurationReport(postMessageDuration: number, timeout: number, actionType: string): void {
        if (postMessageDuration > timeout) {
            const requestDurationInfo = {
                actionType,
                duration: postMessageDuration,
                inWorker: __WORKER__,
            };

            ReportProxy.weblog({
                module: 'webworker',
                action: 'channel_long_time',
                info: requestDurationInfo,
            });
        }
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
                 * ["00:35.022", "alloyWorker--test ►", "w_2o-bRMLmGwXi5V", "HeartBeatTest", 1]
                 * `►` 表示 Worker 线程收到的信息
                 */
                console.log([
                    getDebugTimeStamp(),
                    `${self.name} ►`,
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
                 * ["00:35.023", "️◄ alloyWorker--test", "w_2o-bRMLmGwXi5V", undefined, 1]
                 * `◄` 表示 Worker 线程发出的信息
                 */
                console.log([
                    getDebugTimeStamp(),
                    `️◄ ${self.name}`,
                    message.sessionId,
                    message.actionType,
                    message.payload,
                ]);
            }
        }
    }
}
