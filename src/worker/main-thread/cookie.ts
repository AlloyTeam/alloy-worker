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

    /**
     * 获取 cookie 处理器
     */
    getCookie(): WorkerReponse.Cookie.Cookie {
        const cookie = document.cookie;
        return cookie;
    }
}
