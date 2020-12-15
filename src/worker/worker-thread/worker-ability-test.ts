import type { IWorkerThreadAction } from './index';
import BaseAction from '../common/base-action';
import { WorkerPayload, WorkerReponse } from '../common/payload-type';
import { WorkerAbilityTestActionType } from '../common/action-type';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    protected threadAction: IWorkerThreadAction;

    protected addActionHandler(): void {
        this.controller.addActionHandler(
            WorkerAbilityTestActionType.CommunicationTest,
            this.communicationTest.bind(this)
        );
        this.controller.addActionHandler(WorkerAbilityTestActionType.HeartBeatTest, this.heartBeatTest.bind(this));
    }

    /**
     * 通信能力检测的处理器
     */
    private communicationTest(
        payload: WorkerPayload.WorkerAbilityTest.CommunicationTest
    ): WorkerReponse.WorkerAbilityTest.CommunicationTest {
        // 通过 this.threadAction 调用其他命名空间下的事务
        // this.threadAction.cookie.getCookie().then((res) => {
        //     console.log('document cookie:', res);
        // });
        const mainThreadPostTime = payload;
        // 收到主线程信息的耗时
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }

    /**
     * 心跳检测的处理器
     */
    private heartBeatTest(
        payload: WorkerPayload.WorkerAbilityTest.HeartBeatTest
    ): WorkerReponse.WorkerAbilityTest.HeartBeatTest {
        const heartBeat = payload;
        return heartBeat;
    }
}
