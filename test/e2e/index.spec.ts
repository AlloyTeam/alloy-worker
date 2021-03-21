// @ts-nocheck

/**
 * @author cntchen
 * @priority P0
 * @casetype e2e
 */
describe('Alloy Worker', () => {
    beforeAll(async () => {
        await page.goto('http://127.0.0.1:6842');
    });

    it('test page title', async () => {
        // 页面标题正确
        await expect(page.title()).resolves.toMatch('Alloy Worker');
    });

    it('get worker status', async () => {
        await new Promise(resolve => {
            setTimeout(resolve, 4000);
        });

        const workerStatus = await page.evaluate(() => {
            return Promise.resolve(alloyWorker.workerStatusCheck.workerStatus);
        });

        // worker 可用性状态检查
        expect(workerStatus).not.toBeUndefined();
        expect(workerStatus.hasWorkerClass).toEqual(true);
        expect(workerStatus.canNewWorker).toEqual(true);
        expect(workerStatus.canPostMessage).toEqual(true);
        expect(typeof workerStatus.workerReadyDuration).toEqual('number');
        expect(typeof workerStatus.newWorkerDuration).toEqual('number');
    });

    it('run communicationTest', async () => {
        const testResult = await page.evaluate(() => {
            return alloyWorker.workerAbilityTest.communicationTest();
        })

        // 主线程 worker 通信能力检查成功
        expect(typeof testResult).toEqual('number');
    });

    it('run heartBeatTest', async () => {
        const heartBeatResult = await page.evaluate(() => {
            return alloyWorker.workerAbilityTest.heartBeatTest(1024);
        })

        // 主线程心跳包检查成功
        expect(heartBeatResult).toEqual(1024);
    });
});
