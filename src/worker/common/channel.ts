import { IController, MessageType, IMessage } from '../type';
import nanoid from './nanoid-no-secure';

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
    private onmessage(event: { data: IMessage }) {
        const { data: message } = event;
        const { messageType, sessionId } = message;

        // 接收到请求
        if (messageType === MessageType.REQUEST) {
            this.controller.actionHandler(message).then(actionResult => {
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
    response(sessionId: string, payload: any) {
        this.postMessage({
            messageType: MessageType.REPLY,
            actionType: '',
            payload,
            sessionId,
        });
    }

    /**
     * 封装的 Worker 原生 postMessage 接口
     * 
     * @param message 会话消息
     */
    private postMessage(message: IMessage) {
        this.worker.postMessage(message);
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
    }

    /**
     * 发送请求, 并等待响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     * @param timeOut 等待响应的超时时间
     * @returns {Promise<IMessage>}
     */
    requestPromise(actionType: string, payload: any, timeOut: number = 30000): Promise<any> {
        const sessionId = this.generateSessionId();
        const message = {
            messageType: MessageType.REQUEST,
            actionType,
            payload,
            sessionId,
        };

        // 请求封装为一个 Promise, 等待会话响应器进行 resolve
        const PromiseFunction = (resolve: Function, reject: Function) => {
            const sessionHandler: Function = (message: IMessage) => {
                this.deleteSessionListener(message.sessionId);
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
    private addSessionListener(sessionId: string, handler: Function) {
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
     * @param {string} sessionId
     * @memberof Channel
     */
    private deleteSessionListener(sessionId: string) {
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
        const sessionId: string = `w_${nanoid(14)}`;
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
}
