/* eslint-disable dot-notation */
import MoebiusObject from 'test/any';
import HeartBeatCheck from 'worker/heart-beat-check';
import reportProxy from 'worker/external/report-proxy';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('heart-beat-check', () => {
    const realSetTimeout = global.setTimeout;
    const realClearTimeout = global.clearTimeout;

    const mockMainThreadWorker: any = {
        name: 'defaultWorker',
        controller: {
            addOnmessageListener: jest.fn(),
        },
        // mock worker 能力检查调用并返回检查结果
        workerAbilityTest: {
            heartBeatTest: () => new Promise((resolve) => {
                setTimeout(() => {
                    resolve(1);
                }, 0);
            }),
        },
    }

    it('new', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        // 成功创建实例
        expect(heartBeatCheck).toBeInstanceOf(HeartBeatCheck);
    });

    it('start', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        heartBeatCheck.start();

        // 开始心跳检查后启动了 interVal
        expect(heartBeatCheck['checkInterValHandle']).not.toBeUndefined();
        // 开始心跳检查后添加了 onMessage 的监听
        expect(heartBeatCheck['removeOnmessageListener']).not.toBeUndefined();
    });

    it('start -- interval',  () => {
        const heartBeatCheck = new HeartBeatCheck(mockMainThreadWorker);

        const realSetInterval = global.setInterval;

        // @ts-ignore
        // mock setInterval, 使得调用到 checkheartBeat 函数
        global.setInterval = (callback: any) => {
            callback();
        };

        heartBeatCheck['checkHeartBeat'] = jest.fn();

        heartBeatCheck.start();

        expect(heartBeatCheck['checkHeartBeat']).toBeCalled();

        // @ts-ignore
        global.setInterval = realSetInterval;

    });

    it('stop', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        heartBeatCheck.start();

        // 开始心跳检查后添加了 onMessage 的监听
        expect(heartBeatCheck['removeOnmessageListener']).not.toBeUndefined();

        heartBeatCheck.stop();

        // 结束心跳检查后移除 onMessage 的监听
        expect(heartBeatCheck['removeOnmessageListener']).toBeNull();
    });

    it('checkHeartBeat', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        // @ts-ignore
        global.setTimeout = jest.fn(() => {
            // setTimeout handler
            return 1024;
        });

        heartBeatCheck['checkHeartBeat']();

        expect(heartBeatCheck['isHeartBeatChecking']).toEqual(true);
        // 当前心跳为 1
        expect(heartBeatCheck['heartBeatNow']).toEqual(1);
        expect(heartBeatCheck['checkTimeoutHandle']).not.toBeUndefined();
        expect(global.setTimeout).toBeCalled();

        global.setTimeout = realSetTimeout;
    });

    it('checkHeartBeat -- run twice time', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        heartBeatCheck['checkHeartBeat']();
        heartBeatCheck['checkHeartBeat']();

        // 当前心跳为依然 1
        expect(heartBeatCheck['heartBeatNow']).toEqual(1);
    });

    it('checkHeartBeat -- response from worker', async () => {
        const heartBeatCheck = new HeartBeatCheck(mockMainThreadWorker);

        heartBeatCheck['durationReport'] = jest.fn();

        // 检查 worker 健康
        heartBeatCheck['checkHeartBeat']();

        // 等待 worker 返回检查结果
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, 0);
        });

        expect(heartBeatCheck['isHeartBeatChecking']).toEqual(false);
        expect(heartBeatCheck['durationReport']).toBeCalled();
    });

    it('checkHeartBeat -- timeout', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        heartBeatCheck['checkHealth'] = jest.fn();

        // @ts-ignore
        global.setTimeout = (callback: () => {}) => {
            callback();
        }

        // 检查 worker 健康
        heartBeatCheck['checkHeartBeat']();

        expect(heartBeatCheck['isHeartBeatChecking']).toEqual(false);
        expect(heartBeatCheck['checkHealth']).toBeCalled();

        global.setTimeout = realSetTimeout;
    });

    it('onmessageAsHealthHeartBeat -- before check start', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        global.clearTimeout = jest.fn();

        // 还未开始心跳检查, 就收到回包
        heartBeatCheck['onmessageAsHealthHeartBeat']();

        // 直接返回, 不执行后续逻辑
        expect(heartBeatCheck['isHeartBeatChecking']).toEqual(false);
        expect(global.clearTimeout).toBeCalledTimes(0);

        global.clearTimeout = realClearTimeout;
    });

    it('onmessageAsHealthHeartBeat -- after check start', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        // 进行一次心跳检查
        heartBeatCheck['checkHeartBeat']();

        global.clearTimeout = jest.fn();

        // 收到回包
        heartBeatCheck['onmessageAsHealthHeartBeat']();

        // 将 onmessageAsHealthHeartBeat 作为心跳回包, 结束当前心跳检查
        expect(heartBeatCheck['isHeartBeatChecking']).toEqual(false);
        expect(global.clearTimeout).toBeCalledTimes(1);

        global.clearTimeout = realClearTimeout;
    });

    it('checkHealth -- live', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        heartBeatCheck['stop'] = jest.fn();

        // 写入超时心跳, 没有连续 2 次心跳超时
        heartBeatCheck['sickHeartBeats'] = [1, 3];

        heartBeatCheck['checkHealth']();

        // worker 没有失活, 不会调用停止检查函数
        expect(heartBeatCheck['stop']).toBeCalledTimes(0);
    });

    it('checkHealth -- dead', () => {
        const heartBeatCheck = new HeartBeatCheck(mockMainThreadWorker);

        heartBeatCheck['stop'] = jest.fn();

        // 写入超时心跳, 连续 2 次心跳超时
        heartBeatCheck['sickHeartBeats'] = [1, 2];

        heartBeatCheck['checkHealth']();

        // worker 已经失活, 调用停止检查函数
        expect(heartBeatCheck['stop']).toBeCalled();
    });

    it('showDeadTip', () => {
        const heartBeatCheck = new HeartBeatCheck(mockMainThreadWorker);

        const realConsoleError = console.error;
        console.error = jest.fn();

        heartBeatCheck['showDeadTip']();

        // 调用到实际的 showTip
        expect(console.error).toBeCalled();

        console.error = realConsoleError;
    });

    it('durationReport', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        // 心跳未超时
        heartBeatCheck['durationReport'](20000);

        reportProxy.weblog = jest.fn();

        expect(reportProxy.weblog).toBeCalledTimes(0);

        // 心跳超时
        heartBeatCheck['durationReport'](40000);

        // 调用了超时上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });

    it('deadReport', () => {
        const heartBeatCheck = new HeartBeatCheck(MoebiusObject);

        reportProxy.weblog = jest.fn();

        // 写入超时心跳
        heartBeatCheck['sickHeartBeats'] = [1, 2];

        // worker 失活
        heartBeatCheck['deadReport']();

        // 调用了失活上报
        expect(reportProxy.weblog).toBeCalledTimes(1);
    });
});
