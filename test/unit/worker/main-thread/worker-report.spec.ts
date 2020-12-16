import MoebiusObject from 'test/any';
import MockController from '../mock/mock-controller';
import reportProxy from 'worker/external/report-proxy';
import WorkerReport from 'worker/main-thread/worker-report';
import { WorkerReportActionType } from 'worker/common/action-type';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('worker report', () => {
    it('new', () => {
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        expect(workerReport).toBeInstanceOf(WorkerReport);
    });

    it('captureWorkerException', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        reportProxy['raven'] = jest.fn();
        reportProxy['monitor'] = jest.fn();

        mockController.trigger(WorkerReportActionType.CaptureWorkerException, {
            message: 'testMessage',
            stack: 'testStack',
        });

        expect(reportProxy['raven']).toBeCalled();
        expect(reportProxy['monitor']).toBeCalled();
    });

    it('monitor', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        reportProxy['monitor'] = jest.fn();

        mockController.trigger(WorkerReportActionType.Monitor, 'testMonitor');

        expect(reportProxy['monitor']).toBeCalled();
    });

    it('raven', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, 'testRaven');

        reportProxy['raven'] = jest.fn();

        mockController.trigger(WorkerReportActionType.Raven, MoebiusObject);

        expect(reportProxy['raven']).toBeCalled();
    });

    it('weblog', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        reportProxy['weblog'] = jest.fn();

        mockController.trigger(WorkerReportActionType.Weblog, 'testWeblog');

        expect(reportProxy['weblog']).toBeCalled();
    });
});
