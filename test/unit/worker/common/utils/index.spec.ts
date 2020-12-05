import { isPromise } from 'worker/common/utils';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('utils', () => {
    it('isPromise -- ture', () => {
        const promise = new Promise<void>(resolve => resolve());
        expect(isPromise(promise)).toEqual(true);

        expect(isPromise(Promise.resolve())).toEqual(true);
        expect(isPromise(Promise.reject(new Error('test')))).toEqual(true);

        expect(isPromise({})).toEqual(false);
        expect(isPromise(() => {})).toEqual(false);
    });

    it('isPromise -false', () => {
        expect(isPromise({})).toEqual(false);
        expect(isPromise(() => {})).toEqual(false);
    });
});
