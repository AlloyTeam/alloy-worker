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
    listen(actionType: string, handler: Function) {
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
    actionHandler(message: IMessage) {
        const { actionType, payload } = message;

        if (this.hasActionHandler(actionType)) {
            // 触发指定事务的处理器, 并返回事务处理的结果
            // 支持回调事件是一个 Promise
            const actionResultPromise = this.actionHandlerMap[actionType](payload).catch((error) => {
                // TODO 做错误上报
            });
            return actionResultPromise;
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
}
