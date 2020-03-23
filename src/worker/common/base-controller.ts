import { IController, IMessage } from '../type';
import Channel from './channel';

/**
 * 通信控制器
 *
 * @class BaseController
 */
export default class BaseController implements IController {
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
     * @param [timeOut] 等待响应的
     * @memberof BaseController
     */
    requestPromise(actionType: string, payload: any, timeOut?: number): Promise<any> {
        // 有 Channel 实例才能进行通信, 此时还没有实例化是浏览器不支持创建 worker
        if (this.channel) {
            return this.channel.requestPromise(actionType, payload, timeOut);
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
    listen(actionType: string, handler: Function): void {
        // TODO 修改为数据输出
        // console.log(`%cactionType: ${actionType}`, 'color: orange');
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
                if (this.isPromise(actionResult)) {
                    return actionResult.catch(error => {
                        // TODO 做错误上报
                        console.error('error:', error);
                    });
                }

                // 对数据结果, 包装为 Promise
                return Promise.resolve(actionResult);
            } catch(error) {
                // TODO 做错误上报
                console.error('error:', error);
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
     * 判断是不是 promise
     * @param obj 要判断的对象
     * @returns {boolean} 判断结果
     */
    private isPromise(obj: any): obj is Promise<any> {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

}
