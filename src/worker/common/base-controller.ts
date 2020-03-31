import { IController, IMessage } from '../type';
import Channel from './channel';
import { isPromise } from './utils/index';

/**
 * 通信控制器
 *
 * @class BaseController
 */
export default class BaseController implements IController {
    /**
     * 原生 worker, 在子类中实例化
     */
    protected worker: Worker;
    /**
     * 通信 Channel, 在子类中实例化
     */
    protected channel: Channel;
    /**
     * 事务处理器 Map
     */
    protected actionHandlerMap: {
        [propsName: string]: Function;
    };
    /**
     * 是否调试模式, 默认为否
     */
    isDebugMode = false;

    constructor() {
        this.actionHandlerMap = {};
    }

    /**
     * 发送事务，不等待结果
     *
     * @param actionType 事务类型
     * @param payload 负载
     */
    request(actionType: string, payload: any): void {
        if (this.channel) {
            return this.channel.request(actionType, payload);
        }

        console.error('没有通信 Channel.');
        return;
    }

    /**
     * 发送 Promise 形式的事务, 在 then 中获取响应
     *
     * @param actionType 事务类型
     * @param payload 负载
     * @param [timeout] 响应的超时; Worker 通道是可靠的, 超时后只上报, 不阻止当前请求
     * @memberof BaseController
     */
    requestPromise(actionType: string, payload: any = '', timeout?: number): Promise<any> {
        // 有 Channel 实例才能进行通信, 此时还没有实例化是浏览器不支持创建 worker
        if (this.channel) {
            return this.channel.requestPromise(actionType, payload, timeout);
        }

        // 兼容上层调用的 .then().catch()
        return Promise.reject('没有通信 Channel.');
    }

    /**
     * 添加事务处理器, 不允许重复添加
     *
     * @param actionType 事务类型
     * @param handler 事务处理器
     */
    addActionHandler(actionType: string, handler: (payload: any) => any): void {
        // 调试模式使用
        if (this.isDebugMode) {
            console.log(`%cAdd actionType \`${actionType}\``, 'color: orange');
        }

        if (this.hasActionHandler(actionType)) {
            throw new Error(`已注册事务 \`${actionType}\` 的处理器, 不能重复注册`);
        }
        this.actionHandlerMap[actionType] = handler;
    }

    /**
     * 事务处理器, 提供给通信 Channel 调用
     *
     * @param message 会话消息
     * @returns
     */
    actionHandler(message: IMessage): Promise<any> {
        const { actionType, payload } = message;

        if (this.hasActionHandler(actionType)) {
            // 执行指定的事务处理器, 并返回 Promise 封装的事务结果
            try {
                const actionResult = this.actionHandlerMap[actionType](payload);

                // 对于 Promise 形式的结果, 需要进行 Promise 错误捕获
                if (isPromise(actionResult)) {
                    return actionResult.catch((error) => {
                        // 暴露 Promise 中的异常
                        // Promise 会将运行过程中的报错推入下一个 .catch 的微任务
                        // 通过 setTimeout 将报错抛到一个宏任务中, 暴露出去
                        // 参考: https://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
                        setTimeout(() => {
                            this.reportHandlerError(error);
                        }, 0);
                    });
                }

                // 对数据结果, 包装为 Promise
                return Promise.resolve(actionResult);
            } catch (error) {
                this.reportHandlerError(error);
            }
        } else {
            throw new Error(`没有找到事务 \`${actionType}\` 的处理器, 是否已注册.`);
        }
    }

    /**
     * 判断是否有指定事务的处理器
     *
     * @protected
     * @param actionType 事务类型
     * @returns {boolean}
     */
    protected hasActionHandler(actionType: string): boolean {
        return !!this.actionHandlerMap[actionType];
    }

    /**
     * 上报事务处理器执行报错
     *
     * @param error 报错信息
     */
    protected reportHandlerError(error: any): void {
        console.error('Worker aciton error:', error);

        // 主线程的报错, 在 window.onerror 中可以拿到报错堆栈, 直接抛出即可
        if (!__WORKER__) {
            throw new Error(error);
        }
    }
}
