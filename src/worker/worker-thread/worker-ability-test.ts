import BaseAction from '../common/base-action';
import Controller from './controller';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    addActionHandler() {
        this.controller.addActionHandler(WorkerAbilityTestActionType.MessageTest, this.messageTestHandler.bind(this));
    }

    messageTestHandler(payload: WorkerAbilityTestPayload.IMessageTest) {
        const mainThreadPostTime = payload;
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }
}
