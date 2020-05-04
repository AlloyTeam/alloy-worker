import BaseAction from '../common/base-action';
import { CookieActionType } from '../common/action-type';
import Controller from './controller';

export default class Cookie extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler() {}

    /**
     * 到主线程获取 cookie
     */
    getCookie(): Promise<WorkerReponse.Cookie.Cookie> {
        return this.controller.requestPromise(CookieActionType.Cookie);
    }
}
