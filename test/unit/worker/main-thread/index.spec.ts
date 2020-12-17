import MoebiusObject from 'test/any';
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

    it('startWorkerStatusCheck', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        mainThreadWorker['workerStatusCheck'].check = jest.fn();

        mainThreadWorker['startWorkerStatusCheck']();

        expect(mainThreadWorker['workerStatusCheck'].check).toBeCalled();
    });

    it('startWorkerStatusCheck -- canNewWorker=false', () => {
        const mainThreadWorker = new MainThreadWorker({
            workerName: 'test',
            workerUrl: 'test',
        });

        mainThreadWorker.controller.canNewWorker = false;
        mainThreadWorker['workerStatusCheck'].report = jest.fn();

        mainThreadWorker['startWorkerStatusCheck']();

        expect(mainThreadWorker['workerStatusCheck'].report).toBeCalled();
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
});
