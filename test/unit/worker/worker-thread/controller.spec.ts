import MoebiusObject from 'test/any';
import Controller from 'worker/worker-thread/controller';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('controller', () => {
    it('new', () => {
        const controller = new Controller();

        expect(controller).toBeInstanceOf(Controller);
    });

    it('debugMode', () => {
        // https://github.com/facebook/jest/issues/890
        const url = 'https://alloy-worker.com?debugWorker=true';
        Object.defineProperty(window, 'location', {
            value: {
                href: url,
            },
        });

        const controller = new Controller();

        expect(controller['isDebugMode']).toEqual(true);
    });

    it('reportActionHandlerError', () => {
        const controller = new Controller();

        // @ts-ignore
        global.alloyWorker = {
            workerReport: {
                captureWorkerException: jest.fn(),
            },
        };

        controller['reportActionHandlerError']('testAction', new Error('testError'));

        // @ts-ignore
        expect(global.alloyWorker.workerReport.captureWorkerException).toBeCalled();
    });

    it('reportActionHandlerError -- throw', () => {
        const controller = new Controller();

        // 不是标准的错误信息, 继续抛出
        expect(() => {
            controller['reportActionHandlerError']('testAction', 'testError');
        }).toThrow();
    });
});
