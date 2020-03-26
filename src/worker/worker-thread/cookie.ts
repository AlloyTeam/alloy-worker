import BaseAction from '../common/base-action';
import Controller from './controller';

export default class Cookie extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler() {
    }

    getCookie() {
        this.controller.requestPromise(CookieActionType.Cookie)
            .then(payload => {
                console.log('document cookie:', payload);
            });
    }
}
