import BaseAction from '../common/base-action';
import Controller from './controller';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler() {}

    /**
     * 通信能力检测
     */
    communicationTest() {
        const mainThreadPostTime: WorkerPayload.WorkerAbilityTest.ICommunicationTest = Date.now();
        return this.controller.requestPromise(WorkerAbilityTestActionType.CommunicationTest, mainThreadPostTime);
    }

    /**
     * 心跳检测
     */
    heartBeatTest(heartBeat: WorkerPayload.WorkerAbilityTest.IHeartBeatTest) {
        return this.controller.requestPromise(WorkerAbilityTestActionType.HeartBeatTest, heartBeat);
    }
}
