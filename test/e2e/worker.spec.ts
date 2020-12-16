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

    it('new worker success', async () => {
        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        });

        const workers = await page.workers();

        expect(workers.length).toEqual(1);
    });

    it('worker url', async () => {
        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        });

        const workers = await page.workers();

        const url = await workers[0].url();

        expect(/public-worker/i.test(url)).toEqual(true);
    });

    it('get cookie from main thread', async () => {
        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        });

        await page.setCookie({
            name: 'alloy',
            value: 'worker',
        });

        const workers = await page.workers();

        const mainThreadCookie = await workers[0].evaluate(() => {
            return alloyWorker.cookie.getCookie();
        });

        expect(/alloy=worker/i.test(mainThreadCookie)).toEqual(true);
    });
});
