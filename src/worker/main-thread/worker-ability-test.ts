import BaseAction from '../common/base-action';
import Controller from './controller';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    addActionHandler() {}

    runTest() {
        const mainThreadPostTime = Date.now();
        const payload: WorkerAbilityTestPayload.IMessageTest = mainThreadPostTime;
        return this.controller.requestPromise(WorkerAbilityTestActionType.MessageTest, payload);
    }
}
