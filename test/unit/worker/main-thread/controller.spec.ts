import reportProxy from 'worker/external/report-proxy';
import MockWorker from '../mock/mock-worker';
import Controller from 'worker/main-thread/controller';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('controller', () => {
    // @ts-ignore
    const originWorker = global.Worker;
    let mockWorker: any;

    beforeEach(() => {
        mockWorker = MockWorker;
        // @ts-ignore
        global.Worker = mockWorker;

        // @ts-ignore
        global.__WORKER__ = false;

        // 判断为有 Worker Class
        Controller.hasWorkerClass = true;
    });

    afterEach(() => {
        // @ts-ignore
        global.Worker = originWorker;

        // @ts-ignore
        delete global.__WORKER__;
    });

    it('new', () => {
        const controller = new Controller({
            workerUrl: 'test',
            workerName: 'test',
        });

        expect(controller.canNewWorker).toBe(true);
        expect(controller['worker']).toBeInstanceOf(Worker);
    });

    test('new -- throwError', () => {
        // @ts-ignore
        global.Worker = undefined;

        const controller = new Controller({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(controller.canNewWorker).toBe(false);
        expect(controller['worker']).toBeUndefined();
    });

    test('new -- canNewWorker=false', () => {
        // 判断为没有 Worker Class
        Controller.hasWorkerClass = false;

        const controller = new Controller({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(controller.canNewWorker).toBe(false);
        expect(controller['worker']).toBeUndefined();
    });

    it('terminate', () => {
        const controller = new Controller({
            workerName: 'test',
            workerUrl: 'test',
        });

        controller['worker'].terminate = jest.fn();

        controller['terminate']();

        expect(controller['worker'].terminate).toBeCalled();
    });

    it('reportActionHandlerError', () => {
        const controller = new Controller({
            workerName: 'test',
            workerUrl: 'test',
        });

        expect(() => {
            controller['reportActionHandlerError']('testActionType', {});
        }).toThrowError();
    });

    it('worker onerror', () => {
        const controller = new Controller({
            workerUrl: 'test',
            workerName: 'test',
        });

        reportProxy['raven'] = jest.fn();

        // @ts-ignore
        controller['worker'].onerror();

        expect(reportProxy['raven']).toBeCalled();
    })
});

