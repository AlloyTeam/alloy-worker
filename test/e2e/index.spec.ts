// @ts-nocheck

describe('Alloy Worker', () => {
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:6843');
    });

    it('test page title', async () => {
      await expect(page.title()).resolves.toMatch('Alloy Worker');
    });

    it('get worker status', async () => {
        await new Promise(resolve => {
            setTimeout(resolve, 4000);
        });

        const workerStatus = await page.evaluate(() => {
            return Promise.resolve(alloyWorker.workerStatusCheck.workerStatus);
        });

        expect(workerStatus).not.toBeUndefined();
        expect(workerStatus.hasWorkerClass).toEqual(true);
        expect(workerStatus.canNewWorker).toEqual(true);
        expect(workerStatus.canPostMessage).toEqual(true);
        expect(typeof workerStatus.workerReadyDuration).toEqual('number');
        expect(typeof workerStatus.newWorkerDuration).toEqual('number');
    })

    it('run communicationTest', async () => {
        const testResult = await page.evaluate(() => {
            return alloyWorker.workerAbilityTest.communicationTest();
          })

          expect(typeof testResult).toEqual('number');
    });

    it('run heartBeatTest', async () => {
        const heartBeatResult = await page.evaluate(() => {
            return alloyWorker.workerAbilityTest.heartBeatTest(1024);
          })

          expect(heartBeatResult).toEqual(1024);
    });
  });
