import MoebiusObject from 'test/any';
import reportProxy from 'worker/external/report-proxy';
import WorkerReport from 'worker/main-thread/worker-report';

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
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        reportProxy['raven'] = jest.fn();
        reportProxy['monitor'] = jest.fn();

        workerReport['captureWorkerException']({
            message: 'testMessage',
            stack: 'testStack',
        });

        expect(reportProxy['raven']).toBeCalled();
        expect(reportProxy['monitor']).toBeCalled();
    });

    it('monitor', () => {
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        reportProxy['monitor'] = jest.fn();

        workerReport['monitor'](MoebiusObject);

        expect(reportProxy['monitor']).toBeCalled();
    });

    it('raven', () => {
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        reportProxy['raven'] = jest.fn();

        workerReport['raven'](MoebiusObject);

        expect(reportProxy['raven']).toBeCalled();
    });

    it('weblog', () => {
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        reportProxy['weblog'] = jest.fn();

        workerReport['weblog'](MoebiusObject);

        expect(reportProxy['weblog']).toBeCalled();
    });
});
