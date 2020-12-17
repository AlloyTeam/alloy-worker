/* eslint-disable dot-notation */
import MoebiusObject from 'test/any';
import WorkerStatusCheck from 'worker/worker-status-check';
import reportProxy from 'worker/external/report-proxy';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('worker-status-check', () => {
    beforeEach(() => {
        // 重置一下类属性
        WorkerStatusCheck.hasReportWorkerStatus = false;
    });

    const mockMainThreadWorker: any = {
        name: 'defaultWorker',
        // mock worker 能力检查调用并返回检查结果
        workerAbilityTest: {
            communicationTest: () => new Promise((resolve) => {
                setTimeout(() => {
                    resolve(Date.now());
                }, 0);
            }),
        },
    }
    const mockController: any = {
        timeBeforeNewWorker: 0,
        timeAfterNewWorker: 1,
        isDebugMode: true,
    };

    it('new', () => {
        const wokrerStatusCheck = new WorkerStatusCheck(MoebiusObject, MoebiusObject);

        // 成功创建实例
        expect(wokrerStatusCheck).toBeInstanceOf(WorkerStatusCheck);
    });

    it('check', async () => {
        const wokrerStatusCheck = new WorkerStatusCheck(MoebiusObject, mockMainThreadWorker);

        wokrerStatusCheck['report'] = jest.fn();

        wokrerStatusCheck['check']();

        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });

        expect(wokrerStatusCheck['report']).toBeCalled();
    });

    it('report', () => {
        const wokrerStatusCheck = new WorkerStatusCheck(mockController, MoebiusObject);

        reportProxy.weblog = jest.fn();

        wokrerStatusCheck['report'](false, 1024);

        // 进行了 weblog 上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });

    it('report -- twice', () => {
        const wokrerStatusCheck = new WorkerStatusCheck(mockController, MoebiusObject);

        reportProxy.weblog = jest.fn();

        wokrerStatusCheck['report'](false, 1024);
        // 重复调用状态上报
        wokrerStatusCheck['report'](false, 1024);

        // 不会重复上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });
});
