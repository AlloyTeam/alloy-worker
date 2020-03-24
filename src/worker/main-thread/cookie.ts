import Controller from './controller';

export default class Cookie {
    private controller: Controller;

    constructor(controller: Controller) {
        this.controller = controller;
        this.addActionListener();
    }

    /**
     * 添加事务处理函数
     */
    private addActionListener() {
        this.controller.listen(CookieActionType.Cookie, this.getCookie.bind(this));
    }

    getCookie() {
        const cookie = document.cookie;
        return cookie;
    }
}
