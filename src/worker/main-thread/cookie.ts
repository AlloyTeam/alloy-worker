import BaseAction from '../common/base-action';
import { CookieActionType } from '../common/action-type';
import Controller from './controller';

export default class Cookie extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler() {
        this.controller.addActionHandler(CookieActionType.Cookie, this.getCookie.bind(this));
    }

    getCookie() {
        const cookie = document.cookie;
        return cookie;
    }
}
