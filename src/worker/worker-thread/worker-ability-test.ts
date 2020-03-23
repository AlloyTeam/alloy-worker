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
    private addActionListener() {
        this.controller.listen(WorkerAbilityTestActionType.MessageTest, this.messageTestHandler.bind(this));
    }

    messageTestHandler(payload: WorkerAbilityTestPayload.IMessageTest) {
        const mainThreadPostTime = payload;
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }
}
