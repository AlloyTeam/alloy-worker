/* eslint-disable dot-notation */
import MoebiusObject from 'test/any';
import MockWorker, { mockPostMessagePayload } from '../mock/mock-worker';
import { MessageType } from 'worker/type';
import Channel from 'worker/common/channel';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('channel', () => {
    const TestActionType = 'testActionType';
    const TestSessionId = 'testSessionId';

    const TestMessage = {
        messageType: MessageType.REQUEST,
        actionType: TestActionType,
        sessionId: TestSessionId,
        payload: '',
    };

    const realInt8Array = Int8Array;
    beforeAll(() => {
        // 设置环境为 worker 线程
        global.__WORKER__ = true;

        // jest 环境下, (Int8Array.from([1,2]).buffer instanceof ArrayBuffer) 为 false
        // 所以需要把 Int8Array mock 掉
        // https://github.com/facebook/jest/issues/7780
        global.Int8Array = {
            // @ts-ignore
            from: () => ({
                buffer: new ArrayBuffer(2),
            }),
        };
    });

    afterAll(() => {
        // @ts-ignore
        delete global.__WORKER__;

        global.Int8Array = realInt8Array;
    });

    it('new', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        expect(channel).toBeInstanceOf(Channel);
    });

    it('request', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        let sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;
        expect(sessionHandlerCount).toBe(0);

        channel.request('test', 'test');

        sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;
        // 添加了一个 sessionHandler
        expect(sessionHandlerCount).toBe(1);
    });

    it('requestPromise', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        let sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;
        expect(sessionHandlerCount).toBe(0);

        const result = channel.requestPromise('test', 'test');

        // 返回一个 Promise
        expect(result).toBeInstanceOf(Promise);

        sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;
        // 添加了一个 sessionHandler
        expect(sessionHandlerCount).toBe(1);
    });

    it('onmessage -- request', async () => {
        const mockController: any = {
            actionHandler: () => Promise.resolve('actionResult'),
        };

        const channel = new Channel(MoebiusObject, mockController);
        channel['response'] = jest.fn();

        channel['onmessage']({
            data: TestMessage,
        });

        // 需要等一个 Promise resolve
        await Promise.resolve();

        // 收到 request 后调用了 response
        expect(channel['response']).toBeCalled();
    });

    it('onmessage -- reply', async () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        const sessionHandler = jest.fn();
        // 注册 sessionHandler
        channel['addSessionHandler'](TestSessionId, sessionHandler);

        channel['onmessage']({
            data: {
                ...TestMessage,
                // 消息类型为 REPLY
                messageType: MessageType.REPLY,
            },
        });

        // 收到 reply, 调用了 sessionHandler
        expect(sessionHandler).toBeCalled();
    });

    it('onmessage -- reply error', async () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        // 没有注册过 sessionHandler, 收到 reply 报错
        expect(() => {
            channel['onmessage']({
                data: {
                    ...TestMessage,
                    messageType: MessageType.REPLY,
                },
            });
        }).toThrowError();
    });

    it('requestPromise -- timeout', async () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        // mock timeoutReport
        channel['channelReport']['timeoutReport'] = jest.fn();

        // timeout 设定为 0
        const result = channel.requestPromise('test', 'test', 0);
        expect(result).toBeInstanceOf(Promise);

        const sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;
        // 添加了1个 sessionHandler
        expect(sessionHandlerCount).toBe(1);

        // 对齐源码中的延迟
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        }).then(() => {
            // 断言调用了上报函数
            expect(channel['channelReport']['timeoutReport']).toBeCalled();
        });
    });

    it('response', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        channel['postMessage'] = jest.fn();

        channel['response'](TestSessionId, TestActionType, '');

        expect(channel['postMessage']).toBeCalled();
    });

    it('postMessage -- normal', () => {
        const mockWorker: any = new MockWorker();

        const channel = new Channel(mockWorker, MoebiusObject);

        // payload 为字符串
        channel['postMessage']({
            ...TestMessage,
            payload: 'testPayload',
        });

        expect(mockPostMessagePayload.data.message!.payload).toEqual('testPayload');
        expect(mockPostMessagePayload.data.transferList).toEqual([]);

        // payload 为空对象
        channel['postMessage']({
            ...TestMessage,
            payload: {},
        });

        expect(mockPostMessagePayload.data.message!.payload).toEqual({});
        expect(mockPostMessagePayload.data.transferList).toEqual([]);
    });

    it('postMessage -- transfer', () => {
        const mockWorker: any = new MockWorker();

        const channel = new Channel(mockWorker, MoebiusObject);

        // 发送 ArrayBuffer
        channel['postMessage']({
            ...TestMessage,
            payload: {
                transferA: new ArrayBuffer(4),
                transferProps: ['transferA'],
            },
        });

        // transfer 列表里为 ArrayBuffer
        expect(mockPostMessagePayload.data.transferList![0]).toBeInstanceOf(ArrayBuffer);

        // 发送 Int8Array
        channel['postMessage']({
            ...TestMessage,
            payload: {
                transferA: Int8Array.from([1, 2]),
                transferProps: ['transferA'],
            },
        });

        // transfer 列表里为 ArrayBuffer
        expect(mockPostMessagePayload.data.transferList![0]).toBeInstanceOf(ArrayBuffer);
    });

    it('postMessage -- transfer without buffer', () => {
        const mockWorker: any = new MockWorker();

        const channel = new Channel(mockWorker, MoebiusObject);

        // 发送 ArrayBuffer
        channel['postMessage']({
            ...TestMessage,
            payload: {
                transferA: 'not buffer',
                transferProps: ['transferA'],
            },
        });

        // transfer 列表里为空
        expect(mockPostMessagePayload.data.transferList.length).toEqual(0);
    });

    it('addSessionHandler', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        channel['addSessionHandler'](TestSessionId, jest.fn);
        const sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;

        expect(sessionHandlerCount).toEqual(1);

        // 重复添加同一 sessionId 的 handler 报错
        expect(() => {
            channel['addSessionHandler'](TestSessionId, jest.fn);
        }).toThrowError();
    });

    it('deleteSessionHandler', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        channel['addSessionHandler'](TestSessionId, jest.fn);
        let sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;

        expect(sessionHandlerCount).toEqual(1);

        channel['deleteSessionHandler'](TestSessionId);
        sessionHandlerCount = Object.keys(channel['sessionHandlerMap']).length;

        // 删除 session handler 后 sessionHandlerMap 为空
        expect(sessionHandlerCount).toEqual(0);
    });

    it('generateSessionId', () => {
        const channel = new Channel(MoebiusObject, MoebiusObject);

        const sessionId = channel['generateSessionId']();

        // sessionId 长度为 16 位
        expect(sessionId.length).toEqual(16);
    });
});
