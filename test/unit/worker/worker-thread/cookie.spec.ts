import MoebiusObject from 'test/any';
import Cookie from 'worker/worker-thread/cookie';
import MockController, { mockResponseData } from '../mock/mock-controller';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('cookie', () => {
    it('new', () => {
        const cookie = new Cookie(MoebiusObject, MoebiusObject);

        expect(cookie).toBeInstanceOf(Cookie);
    });

    it('getCookie', async () => {
        const mockController: any = new MockController();
        const cookie = new Cookie(mockController, MoebiusObject);

        // mock reponse cookie
        mockResponseData.data = '1024';

        const cookieStr = await cookie['getCookie']();

        expect(cookieStr).toEqual('1024');
    });
});
