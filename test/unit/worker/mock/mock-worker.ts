
// mock 请求返回的数据, 使用 getter/setter 使得测试中可以修改 mock 数据
export const mockPostMessagePayload: any = {
    originData: '',
    get data() {
        return this.originData;
    },
    set data(data) {
        this.originData = data;
    },
};

export default class MockWorker {
    public addEventListener = jest.fn();
    public terminate = jest.fn();
    public postMessage = (message: any, transferList: any) => {
        mockPostMessagePayload.data = {
            message,
            transferList,
        };
    };
}
