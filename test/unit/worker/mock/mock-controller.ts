// mock 请求返回的数据, 使用 getter/setter 使得测试中可以修改 mock 数据
export const mockResponseData: any = {
    originData: '',
    get data() {
        return this.originData;
    },
    set data(data) {
        this.originData = data;
    },
};

export default class MockController {
    protected actionHandlerMap: {
        [propsName: string]: Function;
    } = {};

    public addActionHandler(actionType: string, handler: (payload: any) => any) {
        this.actionHandlerMap[actionType] = handler;
    }

    // 测试中主动触发事件
    public trigger(actionType: string, response: any) {
        return this.actionHandlerMap[actionType](response);
    }

    public wait() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0);
        });
    }

    public requestPromise() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockResponseData.data);
            }, 0);
        });
    }
}
