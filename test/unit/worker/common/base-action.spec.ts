/* eslint-disable max-nested-callbacks */
import MoebiusObject from 'test/any';
import BaseAction from 'worker/common/base-action';

class Action extends BaseAction {
    protected addActionHandler() {}
}

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('base action', () => {
    it('extend base action', () => {
        const action = new Action(MoebiusObject, MoebiusObject);

        expect(action).toBeInstanceOf(BaseAction);
    })
});
