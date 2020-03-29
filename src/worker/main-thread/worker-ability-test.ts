import BaseAction from '../common/base-action';
import { WorkerAbilityTestActionType } from '../common/action-type';
import Controller from './controller';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {}

    /**
     * 通信能力检测
     */
    communicationTest(): Promise<WorkerReponse.WorkerAbilityTest.CommunicationTest> {
        const mainThreadPostTime: WorkerPayload.WorkerAbilityTest.CommunicationTest = Date.now();
        return this.controller.requestPromise(WorkerAbilityTestActionType.CommunicationTest, mainThreadPostTime);
    }

    /**
     * 心跳检测
     */
    heartBeatTest(
        heartBeat: WorkerPayload.WorkerAbilityTest.HeartBeatTest
    ): Promise<WorkerReponse.WorkerAbilityTest.HeartBeatTest> {
        return this.controller.requestPromise(WorkerAbilityTestActionType.HeartBeatTest, heartBeat);
    }
}
