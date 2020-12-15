import type { IMainThreadAction } from './index';
import BaseAction from '../common/base-action';
import { WorkerPayload, WorkerReponse } from '../common/payload-type';
import { WorkerAbilityTestActionType } from '../common/action-type';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    protected threadAction: IMainThreadAction;

    /**
     * 通信能力检测
     */
    public communicationTest(): Promise<WorkerReponse.WorkerAbilityTest.CommunicationTest> {
        const mainThreadPostTime: WorkerPayload.WorkerAbilityTest.CommunicationTest = Date.now();
        return this.controller.requestPromise(WorkerAbilityTestActionType.CommunicationTest, mainThreadPostTime);
    }

    /**
     * 心跳检测
     */
    public heartBeatTest(
        heartBeat: WorkerPayload.WorkerAbilityTest.HeartBeatTest
    ): Promise<WorkerReponse.WorkerAbilityTest.HeartBeatTest> {
        return this.controller.requestPromise(WorkerAbilityTestActionType.HeartBeatTest, heartBeat);
    }

    protected addActionHandler(): void {}
}
