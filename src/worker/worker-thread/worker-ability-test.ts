import BaseAction from '../common/base-action';
import Controller from './controller';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler() {
        this.controller.addActionHandler(WorkerAbilityTestActionType.CommunicationTest, this.CommunicationTestHandler.bind(this));
        this.controller.addActionHandler(WorkerAbilityTestActionType.HeartBeatTest, this.heartBeatTestHandler.bind(this));
    }

    /**
     * 通信能力检测的处理器
     */
    private CommunicationTestHandler(payload: WorkerPayload.WorkerAbilityTest.ICommunicationTest) {
        const mainThreadPostTime = payload;
        // 收到主线程信息的耗时
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }

    /**
     * 心跳检测的处理器
     */
    private heartBeatTestHandler(payload: WorkerPayload.WorkerAbilityTest.IHeartBeatTest) {
        const heartBeat = payload;
        return heartBeat;
    }
}
