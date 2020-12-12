
import nanoid from 'worker/common/utils/nanoid-no-secure';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('nanoid-no-secure', () => {
    it('nanoid', () => {
        const sessionId = nanoid();

        // 默认 id 长度为 21
        expect(sessionId.length).toEqual(21);
    });

    it('nanoid -- get sessionId', () => {
        const sessionId = `w_${nanoid(14)}`;

        // alloy worker 的 sessionId 长度为 16
        expect(sessionId.length).toEqual(16);
    });
});
