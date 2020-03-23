import Controller from './controller';

export default class WorkerAbilityTest {
    private controller: Controller;

    constructor(controller: Controller) {
        this.controller = controller;
        this.addActionListener();
    }

    /**
     * 添加事务处理函数
     */
    private addActionListener() {}

    runTest() {
        const mainThreadPostTime = Date.now();
        const payload: WorkerAbilityTestPayload.IMessageTest = mainThreadPostTime;
        return this.controller.requestPromise(WorkerAbilityTestActionType.MessageTest, payload);
    }
}
