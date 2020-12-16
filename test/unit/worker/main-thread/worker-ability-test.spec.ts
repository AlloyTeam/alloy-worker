import MoebiusObject from 'test/any';
import MockController from '../mock/mock-controller';
import WorkerAbilityTest from 'worker/main-thread/worker-ability-test';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('worker ability test', () => {
    it('new', () => {
        const workerAbilityTest = new WorkerAbilityTest(MoebiusObject, MoebiusObject);

        expect(workerAbilityTest).toBeInstanceOf(WorkerAbilityTest);
    });

    it('communicationTest', () => {
        const mockController: any = new MockController();
        const workerAbilityTest = new WorkerAbilityTest(mockController, MoebiusObject);

        mockController.requestPromise = jest.fn();

        workerAbilityTest['communicationTest']();

        expect(mockController.requestPromise).toBeCalled();
    });

    it('heartBeatTest', () => {
        const mockController: any = new MockController();
        const workerAbilityTest = new WorkerAbilityTest(mockController, MoebiusObject);

        mockController.requestPromise = jest.fn();

        workerAbilityTest['heartBeatTest'](1024);

        expect(mockController.requestPromise).toBeCalled();
    });
});
