import createAlloyWorker, { getWorkerUrl } from 'worker/index';

jest.mock('worker/main-thread', () => class MainThreadWorker {
    // mock worker status 上报函数
    public startWorkerStatusCheck = jest.fn();
});

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('alloyWorker', () => {
    beforeEach(() => {
        // @ts-ignore
        global.__WORKER__ = false;
    });

    afterEach(() => {
        // @ts-ignore
        delete global.__WORKER__;
    });

    it('createAlloyWorker', async () => {
        const alloyWorker = createAlloyWorker({
            workerName: 'test',
        });

        // 成功创建 worker 实例
        expect(alloyWorker).toBeDefined();

        await new Promise(resolve => resolve());

        // 调用了 worker status 上报函数
        expect(alloyWorker.startWorkerStatusCheck).toBeCalled();
    });

    it('getWorkerUrl', () => {
        const result = getWorkerUrl(false);

        expect(result).toEqual('./WORKER_FILE_NAME_PLACEHOLDER');

        const result_debugMode = getWorkerUrl(true);

        expect(result_debugMode).toEqual('./WORKER_FILE_NAME_PLACEHOLDER?debugWorker=true');
    });
});
