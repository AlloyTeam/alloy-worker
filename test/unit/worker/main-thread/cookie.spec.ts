import MoebiusObject from 'test/any';
import Cookie from 'worker/main-thread/cookie';

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

    it('getCookie', () => {
        const cookie = new Cookie(MoebiusObject, MoebiusObject);

        // mock page cookie
        document.cookie = '1024';

        const cookieStr = cookie['getCookie']();

        expect(cookieStr).toEqual('1024');
    });
});
