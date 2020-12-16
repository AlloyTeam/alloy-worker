import MoebiusObject from 'test/any';
import reportProxy from 'worker/external/report-proxy';
import MainThreadWorker from 'worker/main-thread';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('main-thread-worker', () => {
    // @ts-ignore
    const originWorker = global.Worker;

    beforeEach(() => {
        // @ts-ignore
        global.Worker = MoebiusObject;

        // @ts-ignore
        global.__WORKER__ = false;

        // 重置 class static 属性, 避免多次测试中相互干扰
        MainThreadWorker.hasReportWorkerStatus = false;
    });

    afterEach(() => {
        // @ts-ignore
        global.Worker = originWorker;

        // @ts-ignore
        delete global.__WORKER__;
    });

    it('new', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(mainThreadWorker).toBeInstanceOf(MainThreadWorker);
    });

    it('startHeartBeatCheck', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        mainThreadWorker['heartBeatCheck'].start = jest.fn();
        mainThreadWorker['startHeartBeatCheck']();

        // 进行了心跳检查
        expect(mainThreadWorker['heartBeatCheck'].start).toBeCalled();
    });

    it('startHeartBeatCheck -- terminated', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        mainThreadWorker['heartBeatCheck'].start = jest.fn();
        // worker 线程已经销毁
        mainThreadWorker['isTerminated'] = true;

        mainThreadWorker['startHeartBeatCheck']();

        // 销毁后不会再启动心跳检查
        expect(mainThreadWorker['heartBeatCheck'].start).toBeCalledTimes(0);
    });

    it('terminate', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        mainThreadWorker['terminate']();

        // 销毁成功
        expect(mainThreadWorker['isTerminated']).toEqual(true);
    });

    it('canNewWorker', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(mainThreadWorker.canNewWorker).toEqual(true);
    });

    it('canNewWorker -- false', () => {
        // @ts-ignore
        // 模拟没有 Worker Class, 触发 new Worker 报错
        global.Worker = undefined;

        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(mainThreadWorker.canNewWorker).toEqual(false);
    });

    it('reportWorkerStatus', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        reportProxy.weblog = jest.fn();

        mainThreadWorker['reportWorkerStatus'](false, 1024);

        // 进行了 weblog 上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });

    it('reportWorkerStatus -- twice', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        reportProxy.weblog = jest.fn();

        mainThreadWorker['reportWorkerStatus'](false, 1024);
        // 重复调用状态上报
        mainThreadWorker['reportWorkerStatus'](false, 1024);

        // 不会重复上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });
});
