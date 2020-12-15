import MoebiusObject from 'test/any';
import MockController from '../mock/mock-controller';
import WorkerAbilityTest from 'worker/worker-thread/worker-ability-test';
import { WorkerAbilityTestActionType } from 'worker/common/action-type';

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

        const result = mockController.trigger(WorkerAbilityTestActionType.CommunicationTest, Date.now());

        expect(typeof result).toEqual('number');
    });

    it('heartBeatTest', () => {
        const mockController: any = new MockController();
        const workerAbilityTest = new WorkerAbilityTest(mockController, MoebiusObject);

        const result = mockController.trigger(WorkerAbilityTestActionType.CommunicationTest, 1024);

        expect(result).toEqual(1024);
    });
});
