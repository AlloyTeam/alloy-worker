import type { IMainThreadAction } from './index';
import BaseAction from '../common/base-action';
import { WorkerReponse } from '../common/payload-type';
import { CookieActionType } from '../common/action-type';

export default class Cookie extends BaseAction {
    protected threadAction: IMainThreadAction;

    protected addActionHandler(): void {
        this.controller.addActionHandler(CookieActionType.Cookie, this.getCookie.bind(this));
    }

    /**
     * 获取 cookie 处理器
     */
    private getCookie(): WorkerReponse.Cookie.Cookie {
        const cookie = document.cookie;
        return cookie;
    }
}
