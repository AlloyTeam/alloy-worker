import Controller from './base-controller';

/**
 * 事务的基类
 */
export default abstract class BaseAction {
    /**
     * 通信控制器
     */
    protected controller: Controller;

    constructor(controller: Controller) {
        this.controller = controller;
        this.addActionHandler();
    }

    /**
     * 添加事务的处理器
     */
    protected abstract addActionHandler(): void;
}
