import MoebiusObject from 'test/any';
import MockController from '../mock/mock-controller';
import reportProxy, { ReportProxy } from 'worker/external/report-proxy';
import WorkerReport from 'worker/worker-thread/worker-report';

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

    it('bind read report', () => {
        const workerReport = new WorkerReport(MoebiusObject, MoebiusObject);

        workerReport['monitor'] = jest.fn();
        workerReport['raven'] = jest.fn();
        workerReport['weblog'] = jest.fn();

        // 在构造函数中调用的 loadRealReport 通过 bind 绑定了方法
        // bind 会生成新的方法, 所以测试需要重新绑一次
        WorkerReport.loadRealReport(workerReport);

        reportProxy.monitor();
        reportProxy.raven();
        reportProxy.weblog();

        expect(workerReport['monitor']).toBeCalled();
        expect(workerReport['raven']).toBeCalled();
        expect(workerReport['weblog']).toBeCalled();
    });

    it('captureWorkerException', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        mockController.request = jest.fn();

        workerReport['captureWorkerException']({
            message: 'testMessage',
            stack: 'testStack',
        });

        expect(mockController.request).toBeCalled();
    });

    it('monitor', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        mockController.request = jest.fn();

        workerReport['monitor']('testMonitor');

        expect(mockController.request).toBeCalled();
    });

    it('raven', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        mockController.request = jest.fn();

        workerReport['raven']('testRaven');

        expect(mockController.request).toBeCalled();
    });

    it('weblog', () => {
        const mockController: any = new MockController();
        const workerReport = new WorkerReport(mockController, MoebiusObject);

        mockController.request = jest.fn();

        workerReport['weblog']('testWeblog');

        expect(mockController.request).toBeCalled();
    });
});
