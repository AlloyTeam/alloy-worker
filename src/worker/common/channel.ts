import { IController, MessageType, IMessage } from '../type';
import { CommunicationTimeout } from '../config';
import nanoid from './utils/nanoid-no-secure';
import ChannelReport from './channel-report';

/**
 * 通信通道
 */
export default class Channel {
    /**
     * Web Worker 实例
     */
    private worker: Worker;
    /**
     * 上层通信控制器, 需实现 IController 接口
     */
    private controller: IController;
    /**
     * 会话响应器 Map
     */
    private sessionHandlerMap: {
        [propsName: string]: Function;
    };
    /**
     * Channel 日志上报
     */
    private channelReport: ChannelReport;

    public constructor(worker: Worker, controller: IController) {
        this.worker = worker;
        this.controller = controller;

        this.sessionHandlerMap = {};
        this.channelReport = new ChannelReport(this.controller.isDebugMode);

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
     * @returns {Promise<IMessage>} 等待响应的 Promise
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

        // 启动请求超时计时器
        const timeoutHandler = setTimeout(() => {
            clearTimeout(timeoutHandler);

            this.channelReport.timeoutReport({
                actionType,
                isInWorker: __WORKER__,
            });
        }, timeout);

        // 请求封装为一个 Promise, 等待会话响应器进行 resolve
        const PromiseFunction = (resolve: Function): any => {
            const sessionHandler: Function = (message: IMessage) => {
                // 会话回调函数, 开始处理响应
                this.deleteSessionHandler(message.sessionId);
                clearTimeout(timeoutHandler);

                // 请求时长上报
                const requestDuration = Date.now() - timeRequestStart;
                this.channelReport.requestDurationReport(requestDuration, timeout, actionType);

                resolve(message.payload);
            };

            this.addSessionHandler(sessionId, sessionHandler);

            // 开始发送请求
            this.postMessage(message);
        };

        return new Promise(PromiseFunction);
    }

    /**
     * 收到会话消息的处理函数
     *
     * 发现是请求, 调用通信控制器的事务处理器进行处理, 获取事务结果并响应;
     * 发现是响应，调用会话响应器
     * @param event worker 通信事件
     */
    private onmessage(event: { data: IMessage }): void {
        const { data: message } = event;
        const { messageType, sessionId, actionType } = message;

        this.channelReport.onmesssageDebugLog(message);

        // 接收到请求
        if (messageType === MessageType.REQUEST) {
            // 处理请求
            this.controller.actionHandler(message).then((actionResult) => {
                // 响应请求
                this.response(sessionId, actionType, actionResult);
            });
        }

        // 接收到响应
        if (messageType === MessageType.REPLY) {
            // 处理响应
            if (this.hasSessionHandler(sessionId)) {
                this.sessionHandlerMap[sessionId](message);
            } else {
                throw new Error(`Session \`${sessionId}\` handler no exist`);
            }
        }
    }

    /**
     * 封装的 worker 原生 postMessage 接口
     * 支持 structured clone 和 transfer 2种通信模式
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
                    console.error(`Payload without props ${prop}`);
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
                    console.error(`Payload props ${prop} without buffer`);
                    return;
                }

                // 取 prop 的 buffer 属性, push 到 transfer 数组
                if (payload[prop].buffer instanceof ArrayBuffer) {
                    transferList.push(payload[prop].buffer);
                }
            });
        }

        this.worker.postMessage(message, transferList);
        this.channelReport.postMessageDebugLog(message);
    }

    /**
     * 添加会话响应器
     *
     * @param sessionId 会话 Id
     * @param handler 会话响应器
     */
    private addSessionHandler(sessionId: string, handler: Function): void {
        if (!this.hasSessionHandler(sessionId)) {
            this.sessionHandlerMap[sessionId] = handler;
        } else {
            throw new Error(`SessionId \`${sessionId}\` already exist, Impossible!`);
        }
    }

    /**
     * 移除会话响应器
     *
     * @param sessionId
     */
    private deleteSessionHandler(sessionId: string): void {
        if (this.hasSessionHandler(sessionId)) {
            delete this.sessionHandlerMap[sessionId];
        }
    }

    /**
     * 生成每次独立会话的 Id
     *
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
     * @param sessionId 会话 Id
     * @returns {boolean} 判断结果
     */
    private hasSessionHandler(sessionId: string): boolean {
        return !!this.sessionHandlerMap[sessionId];
    }
}
