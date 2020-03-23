/*
 * Alloy Worker Internal Typing
 */

export interface IAlloyWorkerOptions {
    /**
     * worker 资源 url
     */
    workerUrl: string;
    /**
     * worker 实例名称
     */
    workerName: string;
}

/**
 * 通信控制器需要实现的 interface
 */
export interface IController {
    /**
     * 事务处理器
     */
    actionHandler: Function;
}

/**
 * 会话消息类型枚举
 */
export const enum MessageType {
    REQUEST = 'REQUEST',
    REPLY = 'REPLY',
}

/**
 * 会话消息
 */
export interface IMessage {
    messageType: MessageType;
    actionType: string;
    sessionId: string;
    payload: any;
}
