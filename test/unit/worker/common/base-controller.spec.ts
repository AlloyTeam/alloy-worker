/* eslint-disable max-nested-callbacks */
import MoebiusObject from 'test/any';
import BaseController from 'worker/common/base-controller';
import { MessageType } from 'worker/type';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('base controller', () => {
    // mock channel
    const channel = MoebiusObject;
    // mock worker
    const worker = MoebiusObject;

    const TestActionType = 'testActionType';
    const TestPayload = 'testPayload';
    const HandlerResult = 'handlerResult';

    const testMessage = {
        messageType: MessageType.REQUEST,
        actionType: TestActionType,
        sessionId: 'test',
        payload: TestPayload,
    };

    it('new', () => {
        const baseController = new BaseController();

        expect(baseController).toBeInstanceOf(BaseController);
    });

    it('request', () => {
        const baseController = new BaseController();

        // 没有 channel 时调用
        let result = baseController.request(TestActionType, TestPayload);
        expect(result).not.toBeDefined();

        baseController['channel'] = channel;

        // 有 channel 时调用
        result = baseController.request(TestActionType, TestPayload);
        expect(result).toBeDefined();
    });

    it('requestPromise', async () => {
        const baseController = new BaseController();

        // 没有 channel 时调用
        await baseController.requestPromise(TestActionType, TestPayload)
            .catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });

        baseController['channel'] = channel;

        // 有 channel 时调用
        const result = baseController.requestPromise(TestActionType, TestPayload);
        expect(result).toBeDefined();
    });

    it('addActionHandler', () => {
        const baseController = new BaseController();

        // 注册 actionType 的回调函数
        baseController.addActionHandler(TestActionType, jest.fn());

        expect(Object.keys(baseController['actionHandlerMap']).length).toBe(1);

        // 重复注册 actionType 的回调函数
        expect(() => {
            baseController.addActionHandler(TestActionType, jest.fn());
        }).toThrowError();
    });

    describe('actionHandler', () => {
        it('no handler', async () => {
            const baseController = new BaseController();

            // 没有注册 actionType 的回调函数
            // 调用 actionHandler 报错
            expect(() => {
                baseController.actionHandler(testMessage);
            }).toThrowError();
        });

        it('sync handler', async () => {
            const baseController = new BaseController();

            // 注册 actionType 的回调函数, 回调函数为同步函数
            baseController.addActionHandler(TestActionType, () => HandlerResult);

            await baseController.actionHandler(testMessage).then((result) => {
                expect(result).toBe(HandlerResult);
            });
        });

        it('async handler', async () => {
            const baseController = new BaseController();

            // 注册 actionType 的回调函数, 回调函数为异步函数
            baseController.addActionHandler(
                TestActionType,
                () => new Promise(resolve => resolve(HandlerResult))
            );

            await baseController.actionHandler(testMessage).then((result) => {
                expect(result).toBe(HandlerResult);
            });
        });

        it('sync handler throw Error', async () => {
            const baseController = new BaseController();

            // mock reportActionHandlerError
            baseController['reportActionHandlerError'] = jest.fn();

            // 注册 actionType 的回调函数, 回调函数为同步函数
            baseController.addActionHandler(TestActionType, () => {
                throw new Error('error');
            });

            await baseController.actionHandler(testMessage).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                // 断言调用上报函数
                expect(baseController['reportActionHandlerError']).toBeCalled();
            });
        });

        it('async handler throw Error', async () => {
            const baseController = new BaseController();

            // mock reportActionHandlerError
            baseController['reportActionHandlerError'] = jest.fn();

            // 注册 actionType 的回调函数, 回调函数为异步函数
            baseController.addActionHandler(
                TestActionType,
                () => new Promise(() => {
                    throw new Error('error');
                })
            );

            await baseController.actionHandler(testMessage).catch((error) => {
                // 这里其实不会执行, 因为 Promise reject 异常已经 catch 过, 并且没有再次抛出
                expect(error).toBeInstanceOf(Error);
            });

            // 对齐源码中的延迟
            await new Promise((resolve) => {
                setTimeout(resolve, 0);
            }).then(() => {
                // 断言调用了上报函数
                expect(baseController['reportActionHandlerError']).toBeCalled();
            });
        });
    });

    it('addOnmessageListener', () => {
        const baseController = new BaseController();

        baseController['worker'] = worker;

        const result = baseController.addOnmessageListener(jest.fn());

        expect(result).toBeInstanceOf(Function);
    });
});
