import alloyWorker from 'worker/worker-thread';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('worker thread', () => {
    it('exist', () => {
        expect(alloyWorker).not.toBeUndefined();

        // @ts-ignore
        // 挂载到全局环境
        expect(global.alloyWorker).toEqual(alloyWorker);
    });

    it('worker name', () => {
        // @ts-ignore
        // worker 线程不为空
        expect(global.name).not.toBeUndefined();
    });
});
