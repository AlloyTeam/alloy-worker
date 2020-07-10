import Controller from './base-controller';

/**
 * 事务的基类
 */
export default abstract class BaseAction {
    /**
     * 通信控制器
     */
    protected controller: Controller;
    /**
     * 线程上的
     */
    protected threadAction: any;

    public constructor(controller: Controller, threadAction: any) {
        this.controller = controller;
        this.threadAction = threadAction;

        this.addActionHandler();
    }

    /**
     * 添加事务的处理器
     */
    protected abstract addActionHandler(): void;
}
