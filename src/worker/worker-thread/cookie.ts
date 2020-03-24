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
    }

    getCookie() {
        this.controller.requestPromise(CookieActionType.Cookie)
            .then(payload => {
                console.log('document cookie:', payload);
            });
    }
}
